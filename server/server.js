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
import { Pool } from 'pg';
// import { getBasicSubscriptionUrl, getProSubscriptionUrl } from "./handlers/index";

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

let pgConfig;
const isLocalDb = process.env.DATABASE_URL.includes('shane');
if (process.env.NODE_ENV !== 'production') {
  pgConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalDb ? false : {
        rejectUnauthorized: false
      }
  };
} else {
  pgConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
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

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {

        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const appUninstalledResponse = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!appUninstalledResponse.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${appUninstalledResponse.result}`
          );
        }

        const ordersUpdatedResponse = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "ORDERS_UPDATED",
          webhookHandler: async (topic, shop, body) =>
            console.log(body)
        });

        if (!ordersUpdatedResponse.success) {
          console.log(
            `Failed to register ORDERS_UPDATED webhook: ${ordersUpdatedResponse.result}`
          );
        }

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
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

async function upsertShop(shop) {
  const client = await pgPool.connect()
  try {
    const { id, name, url, email, formattedAddress, planName, partnerDevelopment, shopifyPlus } = shop;
    const selectText = 'SELECT * FROM shop WHERE id = $1'
    const selectValues = [id];
    const selectRes = await client.query(selectText, selectValues);
    if (selectRes.rows.length === 0) {
      const insertText = 'INSERT INTO shop (id, name, url, email, formatted_address, plan_name, partner_development, shopify_plus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
      const insertValues = [id, name, url, email, formattedAddress, planName, partnerDevelopment, shopifyPlus];
      await client.query(insertText, insertValues);
      await client.query('COMMIT');
    } else {
      const updateText = 'UPDATE shop SET name = $1, url = $2, email = $3, formatted_address = $4, plan_name = $5, partner_development = $6, shopify_plus = $7 WHERE id = $8'
      const updateValues = [name, url, email, formattedAddress, planName, partnerDevelopment, shopifyPlus, id];
      await client.query(updateText, updateValues);
      await client.query('COMMIT');
    }
    const selectText2 = 'SELECT * FROM shop';
    const selectValues2 = [];
    const selectRes2 = await client.query(selectText2, selectValues2);
    console.log(selectRes2.rows);
  } catch(e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
