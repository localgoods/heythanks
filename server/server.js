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
        const shop = ctx.query.shop;
        const scope = ctx.query.scope;

        const { accessToken } = await Shopify.Utils.loadOfflineSession(shop);

        try {
          const client = new Shopify.Clients.Graphql(shop, accessToken);

          const shopData = await client.query({
            data: {
              query: shopQuery,
            },
          });

          const shopId = shopData?.body?.data?.shop?.id;

          await checkTheme({ shop, accessToken, shopId });

          await upsertShop({
            id: shopId,
            shop,
            scope,
            access_token: accessToken,
            installed: true,
            requires_update: false,
          });

          return ctx.redirect(`/auth?shop=${shop}`);
        } catch (error) {
          await logError({ shop, error });
        }
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
        const shop = ctx.query?.shop || session?.shop;
        const host = ctx.query?.host || session?.host;

        try {
          // Need to use offline token in webhooks
          const accessToken = await getOfflineToken(shop);
          if (!accessToken) {
            console.log("Redirecting back to offline flow");
            return ctx.redirect(`/install/auth?shop=${shop}`);
          }

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
                } catch (error) {
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

          const ordersCreatedResponse = await Shopify.Webhooks.Registry.register(
            {
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
                      id: usageRecordId,
                      price: parseFloat(orderPrice),
                      currency: "USD",
                      plan_id: usagePlanId,
                      details: order,
                      order_id: orderId,
                      created_at: usageRecordCreatedAt,
                      // Helps us group the orders together by billing period
                      period_end: activeSubscription?.currentPeriodEnd,
                      shop,
                    };

                    await upsertOrderRecord({ shop, orderRecord });
                  }
                } catch (error) {
                  await logError({ shop, error });
                }
              },
            }
          );

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

                    const usageRecord =
                      charge?.body?.data?.appCreditCreate?.appCredit;
                    const usageRecordId = usageRecord?.id;
                    const usageRecordCreatedAt = usageRecord?.createdAt;

                    const orderRecord = {
                      id: usageRecordId,
                      // Mark this as a negative tip!
                      price: -parseFloat(orderPrice),
                      currency: "USD",
                      plan_id: usagePlanId,
                      details: order,
                      order_id: orderId,
                      created_at: usageRecordCreatedAt,
                      // Helps us group the orders together by billing period
                      period_end: activeSubscription?.currentPeriodEnd,
                      shop,
                    };

                    await upsertOrderRecord({ shop, orderRecord });
                  }
                } catch (error) {
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
        } catch (error) {
          if (error?.code === 401) {
            console.log("Redirecting back to offline flow");
            return ctx.redirect(`/install/auth?shop=${shop}`);
          }
          await logError({ shop, error });
        }
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
  } catch (error) {
    await logError({ shop, error });
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
    if (row?.requires_update)
      console.log("Shop is active but requires update...");
    return (
      row !== undefined && row?.installed === true && !row?.requires_update
    );
  } catch (error) {
    console.log("Error getting shop status: ", error);
    return false;
  } finally {
    client.release();
  }
}

async function upsertShop(shop) {
  const shopWithTimestamps = {
    ...shop,
    updated_at: new Date().toISOString(),
  };
  const client = await pgPool.connect();
  try {
    const table = "shop";

    const keys = Object.keys(shopWithTimestamps).filter((key) => {
      return shopWithTimestamps[key] !== undefined;
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
      return shopWithTimestamps[key];
    });

    const upsertQuery =
      "INSERT INTO " +
      table +
      " (" +
      columns +
      ") VALUES (" +
      variables +
      ") ON CONFLICT (id) DO UPDATE SET " +
      names;

    await client.query(upsertQuery, values);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    await logError({ shop: shopWithTimestamps, error });
  } finally {
    client.release();
  }
}

async function upsertOrderRecord({ shop, orderRecord }) {
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

    const upsertQuery =
      "INSERT INTO " +
      table +
      " (" +
      columns +
      ") VALUES (" +
      variables +
      ") ON CONFLICT (id) DO UPDATE SET " +
      names;

    await client.query(upsertQuery, values);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    await logError({ shop, error });
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
      await client.query(insertQuery, values);
      await client.query("COMMIT");
    } else {
      await client.query(updateQuery, values);
      await client.query("COMMIT");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    await logError({ shop, error });
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
  } catch (error) {
    await logError({ shop, error });
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
  } catch (error) {
    await logError({ shop, error });
  } finally {
    client.release();
  }
}

async function checkTheme({ shop, accessToken, shopId }) {
  try {
    // Specify the name of the template the app will integrate with
    const APP_BLOCK_TEMPLATES = ["cart"];

    // Create a new client for the specified shop
    const client = new Shopify.Clients.Rest(shop, accessToken);
    // Use `client.get` to request a list of themes on the shop
    const {
      body: { themes },
    } = await client.get({
      path: "themes",
    });
    // Find the published theme
    const publishedTheme = themes.find((theme) => theme.role === "main");
    // Retrieve a list of assets in the published theme
    const {
      body: { assets },
    } = await client.get({
      path: `themes/${publishedTheme.id}/assets`,
    });
    // Check if JSON template files exist for the template specified in APP_BLOCK_TEMPLATES
    const templateJSONFiles = assets.filter((file) => {
      return APP_BLOCK_TEMPLATES.some(
        (template) => file.key === `templates/${template}.json`
      );
    });
    if (templateJSONFiles.length === APP_BLOCK_TEMPLATES.length) {
      console.log("All desired templates support sections everywhere!");
    } else if (templateJSONFiles.length) {
      console.log(
        "Only some of the desired templates support sections everywhere."
      );
    }
    // Retrieve the body of JSON templates and find what section is set as `main`
    const templateMainSections = (
      await Promise.all(
        templateJSONFiles.map(async (file, index) => {
          let acceptsAppBlock = false;
          const {
            body: { asset },
          } = await client.get({
            path: `themes/${publishedTheme.id}/assets`,
            query: { "asset[key]": file.key },
          });

          const json = JSON.parse(asset.value);

          // Save sections for HeyThanks review
          if (json.sections) {
            await upsertShop({ id: shopId, cart_sections: json.sections });
          }

          const main = Object.entries(json.sections).find(
            ([id, section]) => id === "main" || section.type.startsWith("main-")
          );
          if (main) {
            return assets.find(
              (file) => file.key === `sections/${main[1].type}.liquid`
            );
          }
        })
      )
    ).filter((value) => value);

    // Request the content of each section and check if it has a schema that contains a
    // block of type '@app'
    const sectionsWithAppBlock = (
      await Promise.all(
        templateMainSections.map(async (file, index) => {
          let acceptsAppBlock = false;
          const {
            body: { asset },
          } = await client.get({
            path: `themes/${publishedTheme.id}/assets`,
            query: { "asset[key]": file.key },
          });

          const match = asset.value.match(
            /\{\%\s+schema\s+\%\}([\s\S]*?)\{\%\s+endschema\s+\%\}/m
          );
          const schema = JSON.parse(match[1]);

          if (schema && schema.blocks) {
            acceptsAppBlock = schema.blocks.some((b) => b.type === "@app");
          }

          return acceptsAppBlock ? file : null;
        })
      )
    ).filter((value) => value);
    if (templateJSONFiles.length === sectionsWithAppBlock.length) {
      console.log(
        "All desired templates have main sections that support app blocks!"
      );
    } else if (sectionsWithAppBlock.length) {
      console.log("Only some of the desired templates support app blocks.");
    } else {
      console.log("None of the desired templates support app blocks");
    }
  } catch (error) {
    await logError({ shop, error });
  }
}

async function logError({ shop, error }) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
  const client = await pgPool.connect();
  try {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const table = "error";
    const query = `INSERT INTO ${table} (id, created_at, shop, error) VALUES ($1, $2, $3, $4)`;
    await client.query(query, [id, createdAt, shop, error]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("Error in error logger: ", error);
    throw error;
  } finally {
    client.release();
  }
}
