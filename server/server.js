import { randomUUID } from "crypto";
import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import Body from "koa-body";
import { Pool } from "pg";
import { shopQuery } from "./graphql/queries/shopQuery";
import { appInstallationQuery } from "./graphql/queries/appInstallationQuery";
import { subscriptionQuery } from "./graphql/queries/subscriptionQuery";
import { createCreditMutation } from "./graphql/mutations/createCreditMutation";
import { createUsageMutation } from "./graphql/mutations/createUsageMutation";

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

let pgConfig;
const isLocalDb = process.env.DATABASE_URL.includes("shane");

if (dev) {
  pgConfig = {
    connectionString: process.env.DATABASE_URL,
    // This is just in case we want to use dev code on prod server
    // We'll move away from this as we launch
    ssl: !isLocalDb
      ? {
          rejectUnauthorized: false,
        }
      : false,
  };
} else {
  pgConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}
const pgPool = new Pool(pgConfig);

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // This should be upgraded strategically to perform better for the end user
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    // Need to get an offline token first, one time on each install
    // Can force an app back through this flow with requires_update column on shop table
    createShopifyAuth({
      accessMode: "offline",
      prefix: "/install",
      async afterAuth(ctx) {
        console.log("Running offline flow");
        const session = await Shopify.Utils.loadCurrentSession(
          ctx.req,
          ctx.res
        );
        const shop = ctx.query.shop || session.shop;
        const accessToken = ctx.query.accessToken || session.accessToken;
        const scope = ctx.query.scope || session.scope;
        const client = new Shopify.Clients.Graphql(shop, accessToken);

        const shopData = await client.query({
          data: {
            query: shopQuery,
          },
        });

        const shopId = shopData?.body?.data?.shop?.id;

        await upsertShop({
          id: shopId,
          shop,
          scope,
          access_token: accessToken,
          installed: true,
          requires_update: false,
        });

        return ctx.redirect(`/auth?shop=${shop}`);
      },
    })
  );

  server.use(
    // Need to get online token for each new session
    createShopifyAuth({
      async afterAuth(ctx) {

        const session = await Shopify.Utils.loadCurrentSession(
          ctx.req,
          ctx.res
        );
        const shop = ctx.query.shop || session.shop;
        const host = ctx.query.host || session.host;

        const active = await isShopActive(shop);
        if (!active) {
          // Force app back through offline flow if necessary
          console.log("Redirecting back to offline flow");
          return ctx.redirect(`/install/auth?shop=${shop}`);
        }

        // Need to use offline token in webhooks
        const accessToken = await getOfflineToken(shop);

        // Use offline client in webhooks
        const client = new Shopify.Clients.Graphql(shop, accessToken);

        const shopData = await client.query({
          data: {
            query: shopQuery,
          },
        });
        const shopId = shopData?.body?.data?.shop?.id;

        const cartCreateResponse = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "CARTS_CREATE",
          webhookHandler: async (topic, shop, body) => {
            try {
              const cart = JSON.parse(body);
              await upsertCartCount({ shop, cart });
            } catch (error) {
              console.log("Error in webhook: ", error);
              await logError({ shop, error });
            }
          },
        });

        if (!cartCreateResponse.success) {
          console.log(
            `Failed to register CARTS_CREATE webhook: ${appUninstalledResponse.result}`
          );
          await upsertShop({ id: shopId, requires_update: true });
        } else {
          console.log("Successfully setup CARTS_CREATE webhook");
        }

        const appUninstalledResponse = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: "/webhooks",
            topic: "APP_UNINSTALLED",
            webhookHandler: async (topic, shop, body) => {
              try {
                await upsertShop({
                  id: shopId,
                  // We'll want a new token if they re-install
                  access_token: "",
                  installed: false,
                });
              } catch(error) {
                console.log("Error in webhook: ", error);
                await logError({ shop, error });
              }
            },
          }
        );

        if (!appUninstalledResponse.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${appUninstalledResponse.result}`
          );
          await upsertShop({ id: shopId, requires_update: true });
        } else {
          console.log("Successfully setup APP_UNINSTALLED webhook");
        }

        const ordersCreatedResponse = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "ORDERS_CREATE",
          webhookHandler: async (topic, shop, body) => {
            try {
              const order = JSON.parse(body);
              const orderName = order?.name;
              const orderId = `${order?.admin_graphql_api_id}?id=${order?.name}`;
              const orderLineItems = order?.line_items;
              const orderTip = orderLineItems?.find(
                (item) => item.title === "Fulfillment Tip"
              );

              const orderPrice = (
                orderTip?.quantity * parseInt(orderTip?.price)
              ).toFixed(2);

              const client = new Shopify.Clients.Graphql(shop, accessToken);
              const appInstallationData = await client.query({
                data: {
                  query: appInstallationQuery,
                },
              });
              const appInstallation =
                appInstallationData?.body?.data?.appInstallation;
              const activeSubscription =
                appInstallation?.activeSubscriptions?.[0];

              const subscriptionData = await client.query({
                data: {
                  query: subscriptionQuery,
                  variables: {
                    id: activeSubscription?.id,
                  },
                },
              });

              const appSubscription = subscriptionData?.body?.data?.node;

              // Todo: check capped amount and balance used to notify if needed

              const usageLineItem = appSubscription?.lineItems?.find(
                (item) => item.plan.pricingDetails.balanceUsed
              );
              const usagePlanId = usageLineItem?.id;

              const shouldCharge =
                usagePlanId &&
                activeSubscription?.name === "Pro Plan" &&
                orderTip?.quantity > 0;

              // Only charge for tips if this store is on a HeyThanks Pro Plan
              if (shouldCharge) {
                const charge = await client.query({
                  data: {
                    query: createUsageMutation,
                    variables: {
                      description: `Charge for fulfillment tip in ${orderName}`,
                      price: {
                        amount: parseFloat(orderPrice),
                        currencyCode: "USD",
                      },
                      subscriptionLineItemId: usagePlanId,
                    },
                  },
                });

                const usageRecord =
                  charge?.body?.data?.appUsageRecordCreate?.appUsageRecord;
                const usageRecordId = usageRecord?.id;
                const usageRecordCreatedAt = usageRecord?.createdAt;

                const orderRecord = {
                  id: orderId,
                  price: parseFloat(orderPrice),
                  currency: "USD",
                  plan_id: usagePlanId,
                  details: order,
                  usage_record_id: usageRecordId,
                  created_at: usageRecordCreatedAt,
                  // Helps us group the orders together by billing period
                  period_end: activeSubscription?.currentPeriodEnd,
                  shop,
                };

                await upsertOrderRecord(orderRecord);
              }
            } catch (error) {
              console.log("Error: ", error);
              await logError({ shop, error });
            }
          },
        });

        if (!ordersCreatedResponse.success) {
          console.log(
            `Failed to register ORDERS_CREATE webhook: ${ordersCreatedResponse.result}`
          );
          await upsertShop({ id: shopId, requires_update: true });
        } else {
          console.log("Successfully setup ORDERS_CREATE webhook");
        }

        const ordersCancelledResponse = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: "/webhooks",
            topic: "ORDERS_CANCELLED",
            webhookHandler: async (topic, shop, body) => {
              try {
                const order = JSON.parse(body);
                const orderName = order?.name;
                const orderId = `${order?.admin_graphql_api_id}?id=${order?.name}`;
                const orderLineItems = order?.line_items;
                const orderTip = orderLineItems?.find(
                  (item) => item.title === "Fulfillment Tip"
                );

                const orderPrice = (
                  orderTip?.quantity * parseInt(orderTip?.price)
                ).toFixed(2);

                const client = new Shopify.Clients.Graphql(shop, accessToken);
                const appInstallationData = await client.query({
                  data: {
                    query: appInstallationQuery,
                  },
                });
                const appInstallation =
                  appInstallationData?.body?.data?.appInstallation;
                const activeSubscription =
                  appInstallation?.activeSubscriptions?.[0];

                const subscriptionData = await client.query({
                  data: {
                    query: subscriptionQuery,
                    variables: {
                      id: activeSubscription?.id,
                    },
                  },
                });

                const appSubscription = subscriptionData?.body?.data?.node;

                // Todo: check capped amount and balance used to notify if needed

                const usageLineItem = appSubscription?.lineItems?.find(
                  (item) => item.plan.pricingDetails.balanceUsed
                );
                const usagePlanId = usageLineItem?.id;

                const shouldRefund =
                  usagePlanId &&
                  activeSubscription?.name === "Pro Plan" &&
                  orderTip?.quantity > 0;

                // Only refund for tips if this store is on a HeyThanks Pro Plan
                if (shouldRefund) {
                  const charge = await client.query({
                    data: {
                      query: createCreditMutation,
                      variables: {
                        description: `Refund for fulfillment tip in ${orderName}`,
                        amount: {
                          amount: parseFloat(orderPrice),
                          currencyCode: "USD",
                        },
                        test: dev || shop.includes("local-goods"),
                      },
                    },
                  });

                  console.log("Charge: ", JSON.stringify(charge));

                  const usageRecord =
                    charge?.body?.data?.appCreditCreate?.appCredit;
                  const usageRecordId = usageRecord?.id;
                  const usageRecordCreatedAt = usageRecord?.createdAt;

                  const orderRecord = {
                    id: orderId,
                    // Mark this as a negative tip!
                    price: -parseFloat(orderPrice),
                    currency: "USD",
                    plan_id: usagePlanId,
                    details: order,
                    usage_record_id: usageRecordId,
                    created_at: usageRecordCreatedAt,
                    // Helps us group the orders together by billing period
                    period_end: activeSubscription?.currentPeriodEnd,
                    shop,
                  };

                  await upsertOrderRecord(orderRecord);
                }
              } catch (error) {
                console.log("Error: ", error);
                await logError({ shop, error });
              }
            },
          }
        );

        if (!ordersCancelledResponse.success) {
          console.log(
            `Failed to register ORDERS_CANCELLED webhook: ${ordersCancelledResponse.result}`
          );
          await upsertShop({ id: shopId, requires_update: true });
        } else {
          console.log("Successfully setup ORDERS_CANCELLED webhook");
        }

        // Redirect to app with shop parameter upon auth
        return ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(
    "/gdpr/customers/data_request",
    verifyRequest({ returnHeader: true }),
    (ctx) => {
      console.log("received webhook: ", ctx.state.webhook);
      ctx.body = { message: "No customer data is stored" };
    }
  );

  router.post(
    "/gdpr/customers/redact",
    verifyRequest({ returnHeader: true }),
    (ctx) => {
      console.log("received webhook: ", ctx.state.webhook);
      ctx.body = { message: "No customer data is stored" };
    }
  );

  router.post(
    "/gdpr/shop/redact",
    verifyRequest({ returnHeader: true }),
    (ctx) => {
      console.log("received webhook: ", ctx.state.webhook);
      ctx.body = { message: "No shop data is stored" };
    }
  );

  router.post(
    "/api/upsert-shop",
    verifyRequest({ returnHeader: true }),
    Body(),
    async (ctx, next) => {
      await upsertShop(ctx.request.body);
      ctx.body = ctx.request.body;
      ctx.res.statusCode = 200;
    }
  );

  router.get(
    "/api/get-order-records",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      const { shop, startDate, endDate } = ctx.query;
      console.log((shop, startDate, endDate));
      const orderRecords = await getOrderRecords({ shop, startDate, endDate });
      ctx.body = orderRecords;
      ctx.res.statusCode = 200;
    }
  );

  router.get(
    "/api/get-cart-counts",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      const { shop, startDate, endDate } = ctx.query;
      console.log((shop, startDate, endDate));
      const cartCounts = await getCartCounts({ shop, startDate, endDate });
      ctx.body = cartCounts;
      ctx.res.statusCode = 200;
    }
  );

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const shop = ctx.query?.shop || session?.shop;
    const active = await isShopActive(shop);

    if (!active) {
      console.log("Not active");
      // This shop hasn't been seen yet, go through OAuth to get an offline token
      return ctx.redirect(`/install/auth?shop=${shop}`);
    } else {
      console.log("Active");
      if (session && session.expires && session.expires <= new Date()) {
        console.log("Expired");
        // Session has expired, go through OAuth to create a new session
        return ctx.redirect(`/auth?shop=${shop}`);
      } else {
        console.log("Valid");
        // Session is valid, go to app
        return await handleRequest(ctx);
      }
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

async function getOfflineToken(shop) {
  const client = await pgPool.connect();
  try {
    const table = "shop";
    const query = `SELECT * FROM ${table} WHERE shop = $1`;
    const result = await client.query(query, [shop]);
    const row = result.rows[0];
    return row?.access_token;
  } catch (err) {
    console.log("Error getting offline token: ", JSON.stringify(err));
    return null;
  } finally {
    client.release();
  }
}

async function isShopActive(shop) {
  const client = await pgPool.connect();
  try {
    const table = "shop";
    const query = `SELECT * FROM ${table} WHERE shop = $1`;
    const result = await client.query(query, [shop]);
    const row = result.rows[0];
    if (row.requires_update)
      console.log("Shop is active but requires update...");
    return row !== undefined && row.installed === true && !row.requires_update;
  } catch (err) {
    console.log("Error getting shop status: ", JSON.stringify(err));
    return false;
  } finally {
    client.release();
  }
}

async function upsertShop(shop) {
  const client = await pgPool.connect();
  try {
    const table = "shop";

    const keys = Object.keys(shop).filter((key) => {
      return shop[key] !== undefined;
    });

    const columns = keys.join(", ");

    const names = keys
      .map((key, index) => {
        return key + " = $" + (index + 1);
      })
      .join(", ");

    const variables = keys
      .map((key, index) => {
        return "$" + (index + 1);
      })
      .join(", ");

    const values = keys.map((key) => {
      return shop[key];
    });

    const insertQuery =
      "INSERT INTO " + table + " (" + columns + ") VALUES (" + variables + ")";
    const updateQuery = "UPDATE " + table + " SET " + names;

    const selectShopQuery = "SELECT * FROM shop WHERE id = $1";
    const selectRes = await client.query(selectShopQuery, [shop.id]);

    if (selectRes.rows.length === 0) {
      console.log("Inserting shop: ", shop);
      await client.query(insertQuery, values);
      await client.query("COMMIT");
    } else {
      console.log("Updating shop: ", shop);
      await client.query(updateQuery, values);
      await client.query("COMMIT");
    }
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function upsertOrderRecord(orderRecord) {
  const client = await pgPool.connect();
  try {
    const table = "order_record";

    const keys = Object.keys(orderRecord).filter((key) => {
      return orderRecord[key] !== undefined;
    });

    const columns = keys.join(", ");

    const names = keys
      .map((key, index) => {
        return key + " = $" + (index + 1);
      })
      .join(", ");

    const variables = keys
      .map((key, index) => {
        return "$" + (index + 1);
      })
      .join(", ");

    const values = keys.map((key) => {
      return orderRecord[key];
    });

    const insertQuery =
      "INSERT INTO " + table + " (" + columns + ") VALUES (" + variables + ")";
    const updateQuery = "UPDATE " + table + " SET " + names;

    const selectShopQuery = "SELECT * FROM order_record WHERE id = $1";
    // Check if specific order/usage record exists already
    const selectRes = await client.query(selectShopQuery, [
      orderRecord.usage_record_id,
    ]);

    if (selectRes.rows.length === 0) {
      console.log("Inserting order_record: ", orderRecord);
      await client.query(insertQuery, values);
      await client.query("COMMIT");
    } else {
      console.log("Updating order_record: ", orderRecord);
      await client.query(updateQuery, values);
      await client.query("COMMIT");
    }
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function upsertCartCount({ shop, cart }) {
  const day = cart.created_at.split("T")[0];
  const count = 1;
  const selectQuery = `SELECT * FROM cart_count WHERE shop = $1 AND day = $2`;
  const insertQuery =
    "INSERT INTO cart_count (shop, day, count) VALUES ($1, $2, $3)";
  const updateQuery =
    "UPDATE cart_count SET count = count + $3 WHERE shop = $1 AND day = $2";
  const values = [shop, day, count];
  const client = await pgPool.connect();
  try {
    const selectRes = await client.query(selectQuery, [shop, day]);
    if (selectRes.rows.length === 0) {
      console.log("Inserting cart_count: ", values);
      await client.query(insertQuery, values);
      await client.query("COMMIT");
    } else {
      console.log("Updating cart_count: ", values);
      await client.query(updateQuery, values);
      await client.query("COMMIT");
    }
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function logError({ shop, error }) {
  const client = await pgPool.connect();
  try {
    const id = randomUUID();
    const table = "error";
    const query = `INSERT INTO ${table} (error) VALUES ($1, $2)`;
    await client.query(query, [id, error]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getCartCounts({ shop, startDate, endDate }) {
  const startDay = startDate.split("T")[0];
  const endDay = endDate.split("T")[0];
  const selectQuery = `SELECT * FROM cart_count WHERE shop = $1 AND day >= $2 AND day <= $3`;
  const values = [shop, startDay, endDay];
  const client = await pgPool.connect();
  try {
    const selectRes = await client.query(selectQuery, values);
    return selectRes.rows;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
}

async function getOrderRecords({ shop, startDate, endDate }) {
  const selectQuery = `SELECT * FROM order_record WHERE shop = $1 AND created_at >= $2 AND created_at <= $3`;
  const values = [shop, startDate, endDate];
  const client = await pgPool.connect();
  try {
    const selectRes = await client.query(selectQuery, values);
    return selectRes.rows;
  } catch (e) {
    throw e;
  } finally {
    client.release();
  }
}
