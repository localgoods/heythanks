// Todo: make api for fulfillment form
// Todo: make onboarded api for last step completed
// Todo: make admin component and skeleton
// Todo: test order webhook data and make usage api
// Todo: make order api for external fulfillment lookup
// Todo: review best practices for data (postgres) and session management (shopify)
// Todo: test e2e flow and find obvious needed changes

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

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

let pgConfig;
const isLocalDb = process.env.DATABASE_URL.includes("shane");
if (process.env.NODE_ENV !== "production") {
  pgConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalDb
      ? false
      : {
          rejectUnauthorized: false,
        },
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
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      accessMode: "offline",
      prefix: "/install",
      async afterAuth(ctx) {
        console.log("After auth first");

        const session = await Shopify.Utils.loadCurrentSession(
          ctx.req,
          ctx.res
        );
        const shop = ctx.query.shop || session.shop;
        const accessToken = ctx.query.accessToken || session.accessToken;
        const scope = ctx.query.scope || session.scope;

        console.log('Access token: ', accessToken);

        const client = new Shopify.Clients.Graphql(shop, accessToken);

        const shopData = await client.query({
          data: {
            query: `query {
              shop {
                id
              }
            }`,
          },
        });

        const shopId = shopData?.body?.data?.shop?.id;

        await upsertShop({
          id: shopId,
          shop,
          scope,
          access_token: accessToken,
          installed: true
        });

        ctx.redirect(`/auth?shop=${shop}`);
      },
    })
  );

  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {

        const session = await Shopify.Utils.loadCurrentSession(
          ctx.req,
          ctx.res
        );
        const shop = ctx.query.shop || session.shop;
        const host = ctx.query.host || session.host;

        console.log('shop host: ', shop, host);

        // Get offline access token for webhooks
        const accessToken = await getOfflineToken(shop);
        console.log('Offline access token: ', accessToken);

        if (!accessToken) ctx.redirect(`/install/auth?shop=${shop}`);

        const client = new Shopify.Clients.Graphql(shop, accessToken);

        const shopData = await client.query({
          data: {
            query: `query {
              shop {
                id
              }
            }`,
          },
        });
        const shopId = shopData?.body?.data?.shop?.id;
        const appUninstalledResponse = await Shopify.Webhooks.Registry.register(
          {
            shop,
            accessToken,
            path: "/webhooks",
            topic: "APP_UNINSTALLED",
            webhookHandler: async (topic, shop, body) => {
              await upsertShop({ id: shopId, installed: false });
            },
          }
        );

        if (!appUninstalledResponse.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${appUninstalledResponse.result}`
          );
        }

        const ordersCreatedResponse = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "ORDERS_CREATE",
          webhookHandler: async (topic, shop, body) => {
            try {
              const order = JSON.parse(body);
              const orderId = `${order?.admin_graphql_api_id}?id=${order?.id}`;
              const orderLineItems = order?.line_items;
              const orderTip = orderLineItems?.find(
                (item) => item.title === "Fulfillment Tip"
              );

              const orderPrice = (
                orderTip?.quantity * parseInt(orderTip?.price)
              ).toFixed(2);

              const client = new Shopify.Clients.Graphql(shop, accessToken);
              const shopData = await client.query({
                data: {
                  query: `query{
                    appInstallation {
                      activeSubscriptions {
                        id
                        name
                        status
                      }
                    }
                  }`,
                },
              });
              const appInstallation = shopData?.body?.data?.appInstallation;
              const activeSubscription =
                appInstallation?.activeSubscriptions?.[0];

              const subscriptionData = await client.query({
                data: {
                  query: `query($id: ID!) {
                    node(id: $id) {
                      ...on AppSubscription {
                        id
                        lineItems {
                          id
                          plan {
                            pricingDetails {
                              ...on AppRecurringPricing {
                                interval
                                price {
                                  amount
                                  currencyCode
                                }
                              }
                              ...on AppUsagePricing {
                                terms
                                cappedAmount {
                                  amount
                                  currencyCode
                  
                                }
                                balanceUsed {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }`,
                  variables: {
                    id: activeSubscription?.id,
                  },
                },
              });

              const appSubscription = subscriptionData?.body?.data?.node;

              const usageLineItem = appSubscription?.lineItems?.find(
                (item) => item.plan.pricingDetails.balanceUsed
              );
              const usagePlanId = usageLineItem?.id;

              const shouldCharge =
                usagePlanId &&
                activeSubscription?.name === "Pro Plan" &&
                activeSubscription?.status === "ACTIVE" &&
                orderTip?.quantity > 0;

              if (shouldCharge) {
                const charge = await client.query({
                  data: {
                    query: `mutation appUsageRecordCreate($description: String!, $price: MoneyInput!, $subscriptionLineItemId: ID!) {
                      appUsageRecordCreate(description: $description, price: $price, subscriptionLineItemId: $subscriptionLineItemId) {
                        userErrors {
                            field
                            message
                        }
                        appUsageRecord {
                            id
                            createdAt
                            description
                        }
                      }
                    }`,
                    variables: {
                      description: orderId,
                      price: {
                        amount: parseFloat(orderPrice),
                        currencyCode: "USD",
                      },
                      subscriptionLineItemId: usagePlanId,
                    },
                  },
                });

                const usageRecord = charge?.body?.data?.appUsageRecordCreate?.appUsageRecord;
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
                }

                await upsertOrderRecord(orderRecord);
              }
            } catch (error) {
              console.log("Error: ", error);
            }
          },
        });

        if (!ordersCreatedResponse.success) {
          console.log(
            `Failed to register ORDERS_CREATE webhook: ${ordersCreatedResponse.result}`
          );
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
                const orderId = `${order?.admin_graphql_api_id}?id=${order?.id}`;
                const orderLineItems = order?.line_items;
                const orderTip = orderLineItems?.find(
                  (item) => item.title === "Fulfillment Tip"
                );

                const orderPrice = (
                  orderTip?.quantity * parseInt(orderTip?.price)
                ).toFixed(2);

                const client = new Shopify.Clients.Graphql(shop, accessToken);
                const shopData = await client.query({
                  data: {
                    query: `query{
                    appInstallation {
                      activeSubscriptions {
                        id
                        name
                        status
                      }
                    }
                  }`,
                  },
                });
                const appInstallation = shopData?.body?.data?.appInstallation;
                const activeSubscription =
                  appInstallation?.activeSubscriptions?.[0];

                const subscriptionData = await client.query({
                  data: {
                    query: `query($id: ID!) {
                    node(id: $id) {
                      ...on AppSubscription {
                        id
                        lineItems {
                          id
                          plan {
                            pricingDetails {
                              ...on AppRecurringPricing {
                                interval
                                price {
                                  amount
                                  currencyCode
                                }
                              }
                              ...on AppUsagePricing {
                                terms
                                cappedAmount {
                                  amount
                                  currencyCode
                  
                                }
                                balanceUsed {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }`,
                    variables: {
                      id: activeSubscription?.id,
                    },
                  },
                });

                const appSubscription = subscriptionData?.body?.data?.node;

                const usageLineItem = appSubscription?.lineItems?.find(
                  (item) => item.plan.pricingDetails.balanceUsed
                );
                const usagePlanId = usageLineItem?.id;

                const shouldCharge =
                  usagePlanId &&
                  activeSubscription?.name === "Pro Plan" &&
                  activeSubscription?.status === "ACTIVE" &&
                  orderTip?.quantity > 0;

                if (shouldCharge) {
                  const charge = await client.query({
                    data: {
                      query: `mutation appCreditCreate($amount: MoneyInput!, $description: String!, $test: Boolean!) {
                        appCreditCreate(amount: $amount, description: $description, test: $test) {
                          userErrors {
                            field
                            message
                          }
                          appCredit {
                            id
                            createdAt
                            description
                          }
                        }
                      }`,
                      variables: {
                        description: orderId,
                        amount: {
                          amount: parseFloat(orderPrice),
                          currencyCode: "USD",
                        },
                        test: process.env.NODE_ENV !== "production",
                      },
                    },
                  });

                  console.log('Charge: ', JSON.stringify(charge));

                  const usageRecord = charge?.body?.data?.appCreditCreate?.appCredit;
                  const usageRecordId = usageRecord?.id;
                  const usageRecordCreatedAt = usageRecord?.createdAt;
  
                  const orderRecord = {
                    id: orderId,
                    price: -parseFloat(orderPrice),
                    currency: "USD",
                    plan_id: usagePlanId,
                    details: order,
                    usage_record_id: usageRecordId,
                    created_at: usageRecordCreatedAt,
                  }

                  await upsertOrderRecord(orderRecord);
                }
              } catch (error) {
                console.log("Error: ", error);
              }
            },
          }
        );

        if (!ordersCancelledResponse.success) {
          console.log(
            `Failed to register ORDERS_CANCELLED webhook: ${ordersCancelledResponse.result}`
          );
        } else {
          console.log("Successfully setup ORDERS_CANCELLED webhook");
        }

        console.log(`Redirecting to ${shop} and ${host}`)

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
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
    "/api/upsert-shop",
    verifyRequest({ returnHeader: true }),
    Body(),
    async (ctx, next) => {
      await upsertShop(ctx.request.body);
      ctx.body = ctx.request.body;
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

    console.log(`${shop} is active ${active} with session ${session}`);

    if (!active) {
      console.log("Not active");
      // This shop hasn't been seen yet, go through OAuth to create a session
      ctx.redirect(`/install/auth?shop=${shop}`);
    } else {
      console.log("Active");
      if (session && session.expires && session.expires <= new Date()) {
        console.log("Expired");
        // Session has expired, go through OAuth to create a new session
        return ctx.redirect(`/auth?shop=${shop}`);
      } else {
        console.log("Valid");
        // Session is valid, go to app
        await handleRequest(ctx);
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
  console.log('Shop in offline: ', shop);
  const client = await pgPool.connect();
  try {
    const table = "shop";
    const query = `SELECT * FROM ${table} WHERE shop = $1`;
    const result = await client.query(query, [shop]);
    console.log('Result: ', JSON.stringify(result.rows));
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

    const insertQuery = "INSERT INTO " + table + " (" + columns + ") VALUES (" + variables + ")";
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

    const insertQuery = "INSERT INTO " + table + " (" + columns + ") VALUES (" + variables + ")";
    const updateQuery = "UPDATE " + table + " SET " + names;

    const selectShopQuery = "SELECT * FROM order_record WHERE id = $1";
    // Check if specific order/usage record exists already
    const selectRes = await client.query(selectShopQuery, [orderRecord.usage_record_id]);

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
