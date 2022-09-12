import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import '@babel/polyfill'
import dotenv from 'dotenv'
import 'isomorphic-fetch'
import createShopifyAuth, { verifyRequest } from '@shopify/koa-shopify-auth'
import Koa from 'koa'
import next from 'next'
import Router from 'koa-router'
import Body from 'koa-body'
import { shopQuery } from './graphql/queries/shop-query'
import { appInstallationQuery } from './graphql/queries/app-installation-query'
import { subscriptionQuery } from './graphql/queries/subscription-query'
import { createCreditMutation } from './graphql/mutations/create-credit-mutation'
import { createUsageMutation } from './graphql/mutations/create-usage-mutation'
import Postgres from './providers/postgres'
import Shopify from './providers/shopify'
import Slack from './providers/slack'
dotenv.config()

const port = parseInt(process.env.PORT, 10) || 8081
const dev = !!process.env.DEV_APP
const app = next({
  dev
})
const handle = app.getRequestHandler()

const postgres = new Postgres()
const shopify = new Shopify()
const slack = new Slack()

app.prepare().then(async () => {
  const server = new Koa()
  const router = new Router()
  server.keys = [shopify.Context.API_SECRET_KEY]
  server.use(
    // Need to get an offline token first, one time on each install
    // Can force an app back through this flow with requires_update column on shop table
    createShopifyAuth({
      accessMode: "offline",
      prefix: "/install",
      async afterAuth(ctx) {
        console.log("Running offline auth")
        const { shop, scope } = ctx.query
        const { accessToken } = await shopify.Utils.loadOfflineSession(shop)
        try {
          const graphqlClient = new shopify.Clients.Graphql(shop, accessToken)
          const shopData = await graphqlClient.query({
            data: {
              query: shopQuery,
            },
          })
          const shopId = shopData?.body?.data?.shop?.id
          await checkTheme({ shop, accessToken, shopId })
          await upsertShop({
            id: shopId,
            shop,
            scope,
            access_token: accessToken,
            installed: true,
            requires_update: false,
          })
          return ctx.redirect(`/auth?shop=${shop}`)
        } catch (error) {
          await logError({ shop, error })
          if (error?.code === 401) {
            return ctx.redirect(`/install/auth?shop=${shop}`)
          }
        }
      }
    })
  )

  server.use(
    // Need to get online token for each new session
    createShopifyAuth({
      async afterAuth(ctx) {
        console.log("Running online auth")
        const { req, res } = ctx
        const session = await shopify.Utils.loadCurrentSession(
          req,
          res
        )
        const shop = ctx.query?.shop || session?.shop
        const host = ctx.query?.host || session?.host
        try {
          // Need to use offline token in webhooks
          const accessToken = await getOfflineToken(shop)
          if (!accessToken) {
            console.log("Redirecting back to offline flow")
            return ctx.redirect(`/install/auth?shop=${shop}`)
          }
          // Use offline client in webhooks
          const graphqlClient = new shopify.Clients.Graphql(shop, accessToken)
          const shopData = await graphqlClient.query({
            data: {
              query: shopQuery,
            },
          })
          const shopId = shopData?.body?.data?.shop?.id

          // Webhooks below
          const cartCreateResponse = await shopify.Webhooks.Registry.register({
            shop,
            accessToken,
            path: "/webhooks",
            topic: "CARTS_CREATE",
            webhookHandler: async (topic, shop, body) => {
              try {
                console.log("Running webhooks carts create")
                const cart = JSON.parse(body)
                await upsertCartCount({ shop, cart })
                await slack.send(`🛒 Cart created for ${shop}`)
              } catch (error) {
                await logError({ shop, error })
                if (error?.code === 401) {
                  return ctx.redirect(`/install/auth?shop=${shop}`)
                }
              }
            },
          })
          if (!cartCreateResponse.success) {
            console.log(
              `Failed to register CARTS_CREATE webhook: ${appUninstalledResponse.result}`
            )
            await upsertShop({ id: shopId, requires_update: true })
          } else {
            console.log("Successfully setup CARTS_CREATE webhook")
          }

          const appUninstalledResponse = await shopify.Webhooks.Registry.register(
            {
              shop,
              accessToken,
              path: "/webhooks",
              topic: "APP_UNINSTALLED",
              webhookHandler: async (topic, shop) => {
                try {
                  console.log("Running webhooks app uninstalled")
                  await upsertShop({
                    id: shopId,
                    // We'll want a new token if they re-install
                    access_token: "",
                    installed: false,
                    requires_update: true
                  })
                  await slack.send(`🚮 App uninstalled from ${shop}`)
                } catch (error) {
                  await logError({ shop, error })
                  if (error?.code === 401) {
                    return ctx.redirect(`/install/auth?shop=${shop}`)
                  }
                }
              }
            }
          )

          if (!appUninstalledResponse.success) {
            console.log(
              `Failed to register APP_UNINSTALLED webhook: ${appUninstalledResponse.result}`
            )
            await upsertShop({ id: shopId, requires_update: true })
          } else {
            console.log("Successfully setup APP_UNINSTALLED webhook")
          }

          const ordersCreatedResponse = await shopify.Webhooks.Registry.register(
            {
              shop,
              accessToken,
              path: "/webhooks",
              topic: "ORDERS_CREATE",
              webhookHandler: async (topic, shop, body) => {
                try {
                  console.log("Running webhooks orders create")
                  const order = JSON.parse(body)
                  const orderName = order?.name
                  const orderId = `${order?.admin_graphql_api_id}?id=${order?.name}`
                  const orderLineItems = order?.line_items
                  const orderTip = orderLineItems?.find(
                    (item) => item.title === "Fulfillment Tip"
                  )

                  const orderTipPrice = (
                    orderTip?.quantity * parseInt(orderTip?.price)
                  ).toFixed(2)

                  const graphqlClient = new shopify.Clients.Graphql(shop, accessToken)
                  const appInstallationData = await graphqlClient.query({
                    data: {
                      query: appInstallationQuery,
                    },
                  })
                  const appInstallation =
                    appInstallationData?.body?.data?.appInstallation
                  const activeSubscription =
                    appInstallation?.activeSubscriptions?.[0]

                  const subscriptionData = await graphqlClient.query({
                    data: {
                      query: subscriptionQuery,
                      variables: {
                        id: activeSubscription?.id,
                      },
                    },
                  })

                  const appSubscription = subscriptionData?.body?.data?.node

                  // Todo: check capped amount and balance used to notify if needed

                  const usageLineItem = appSubscription?.lineItems?.find(
                    (item) => item.plan.pricingDetails.balanceUsed
                  )
                  const usagePlanId = usageLineItem?.id

                  const managedPlan = activeSubscription?.name === "Pro Plan"

                  const shouldCharge =
                    usagePlanId &&
                    managedPlan &&
                    orderTip?.quantity > 0

                  let usageRecordId, usageRecordCreatedAt

                  // Only charge for tips if this store is on a HeyThanks Pro Plan
                  if (shouldCharge) {
                    const charge = await graphqlClient.query({
                      data: {
                        query: createUsageMutation,
                        variables: {
                          description: `Charge for fulfillment tip in ${orderName}`,
                          price: {
                            amount: parseFloat(orderTipPrice),
                            currencyCode: "USD",
                          },
                          subscriptionLineItemId: usagePlanId,
                        },
                      },
                    })

                    const usageRecord =
                      charge?.body?.data?.appUsageRecordCreate?.appUsageRecord
                    usageRecordId = usageRecord?.id
                    usageRecordCreatedAt = usageRecord?.createdAt

                  }

                  const id = usageRecordId || randomUUID()
                  const createdAt = usageRecordCreatedAt || new Date().toISOString()

                  const orderRecord = {
                    id,
                    created_at: createdAt,
                    price: parseFloat(orderTipPrice),
                    currency: "USD",
                    plan_id: usagePlanId,
                    details: order,
                    order_id: orderId,
                    // Helps us group the orders together by billing period
                    period_end: activeSubscription?.currentPeriodEnd,
                    shop,
                  }
                  await upsertOrderRecord({ shop, orderRecord })

                  await slack.send(`💰 Order created for ${shop}`)
                  if (orderTipPrice) {
                    await slack.send(`💝 ${orderTipPrice} tip given for ${shop}`)
                  }
                } catch (error) {
                  await logError({ shop, error })
                  if (error?.code === 401) {
                    return ctx.redirect(`/install/auth?shop=${shop}`)
                  }
                }
              }
            }
          )

          if (!ordersCreatedResponse.success) {
            console.log(
              `Failed to register ORDERS_CREATE webhook: ${ordersCreatedResponse.result}`
            )
            await upsertShop({ id: shopId, requires_update: true })
          } else {
            console.log("Successfully setup ORDERS_CREATE webhook")
          }

          const ordersCancelledResponse = await shopify.Webhooks.Registry.register(
            {
              shop,
              accessToken,
              path: "/webhooks",
              topic: "ORDERS_CANCELLED",
              webhookHandler: async (topic, shop, body) => {
                try {

                  const order = JSON.parse(body)
                  const orderName = order?.name
                  const orderId = `${order?.admin_graphql_api_id}?id=${order?.name}`
                  const orderLineItems = order?.line_items
                  const orderTip = orderLineItems?.find(
                    (item) => item.title === "Fulfillment Tip"
                  )

                  const orderTipPrice = (
                    orderTip?.quantity * parseInt(orderTip?.price)
                  ).toFixed(2)

                  const graphqlClient = new shopify.Clients.Graphql(shop, accessToken)
                  const appInstallationData = await graphqlClient.query({
                    data: {
                      query: appInstallationQuery,
                    },
                  })
                  const appInstallation =
                    appInstallationData?.body?.data?.appInstallation
                  const activeSubscription =
                    appInstallation?.activeSubscriptions?.[0]

                  const subscriptionData = await graphqlClient.query({
                    data: {
                      query: subscriptionQuery,
                      variables: {
                        id: activeSubscription?.id,
                      },
                    },
                  })

                  const appSubscription = subscriptionData?.body?.data?.node

                  // Todo: check capped amount and balance used to notify if needed

                  const usageLineItem = appSubscription?.lineItems?.find(
                    (item) => item.plan.pricingDetails.balanceUsed
                  )
                  const usagePlanId = usageLineItem?.id

                  const managedPlan = activeSubscription?.name === "Pro Plan"

                  const shouldRefund =
                    usagePlanId &&
                    managedPlan &&
                    orderTip?.quantity > 0

                  let usageRecordId, usageRecordCreatedAt

                  // Only refund for tips if this store is on a HeyThanks Pro Plan
                  if (shouldRefund) {
                    const charge = await graphqlClient.query({
                      data: {
                        query: createCreditMutation,
                        variables: {
                          description: `Refund for fulfillment tip in ${orderName}`,
                          amount: {
                            amount: parseFloat(orderTipPrice),
                            currencyCode: "USD",
                          },
                          test: dev || shop.includes("local-goods"),
                        },
                      },
                    })

                    const usageRecord =
                      charge?.body?.data?.appCreditCreate?.appCredit
                    usageRecordId = usageRecord?.id
                    usageRecordCreatedAt = usageRecord?.createdAt
                  }

                  const id = usageRecordId || randomUUID()
                  const createdAt = usageRecordCreatedAt || new Date().toISOString()

                  const orderRecord = {
                    id,
                    created_at: createdAt,
                    // Mark this as a negative tip!
                    price: -parseFloat(orderTipPrice),
                    currency: "USD",
                    plan_id: usagePlanId,
                    details: order,
                    order_id: orderId,
                    // Helps us group the orders together by billing period
                    period_end: activeSubscription?.currentPeriodEnd,
                    shop,
                  }
                  await upsertOrderRecord({ shop, orderRecord })
                  await slack.send(`😵 Order cancelled for ${shop}`)
                } catch (error) {
                  await logError({ shop, error })
                  if (error?.code === 401) {
                    return ctx.redirect(`/install/auth?shop=${shop}`)
                  }
                }
              }
            }
          )

          if (!ordersCancelledResponse.success) {
            console.log(
              `Failed to register ORDERS_CANCELLED webhook: ${ordersCancelledResponse.result}`
            )
            await upsertShop({ id: shopId, requires_update: true })
          } else {
            console.log("Successfully setup ORDERS_CANCELLED webhook")
          }

          // Redirect to app with shop parameter upon auth
          return ctx.redirect(`/?shop=${shop}&host=${host}`)
        } catch (error) {
          await logError({ shop, error })
          if (error?.code === 401) {
            return ctx.redirect(`/install/auth?shop=${shop}`)
          }
        }
      },
    })
  )

  const handleRequest = async (ctx, shop) => {
    try {
      await handle(ctx.req, ctx.res)
      ctx.respond = false
      ctx.res.statusCode = 200
    } catch (error) {
      await logError({ shop, error })
      if (error?.code === 401) {
        console.log('Redirecting to auth')
        return ctx.redirect(`/install/auth?shop=${shop}`)
      }
    }
  }

  router.post("/webhooks", async (ctx) => {
    const session = await shopify.Utils.loadCurrentSession(
      ctx.req,
      ctx.res
    )
    const shop = ctx.query?.shop || session?.shop
    try {
      await shopify.Webhooks.Registry.process(ctx.req, ctx.res)
      console.log(`Webhook processed for ${shop}, returned status code 200`)
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`)
      await logError({ shop, error })
    }
  })

  router.post(
    "/gdpr/customers/data_request",
    verifyRequest({ returnHeader: true }),
    (ctx) => {
      console.log("Running gdpr cumstomers data_request", ctx.state.webhook)
      ctx.body = { message: "No customer data is stored" }
    }
  )

  router.post(
    "/gdpr/customers/redact",
    verifyRequest({ returnHeader: true }),
    (ctx) => {
      console.log("Running gdpr customers redact", ctx.state.webhook)
      ctx.body = { message: "No customer data is stored" }
    }
  )

  router.post(
    "/gdpr/shop/redact",
    verifyRequest({ returnHeader: true }),
    (ctx) => {
      console.log("Running gdpr shop redact", ctx.state.webhook)
      ctx.body = { message: "No shop data is stored" }
    }
  )

  router.post(
    "/api/upsert-shop",
    verifyRequest({ returnHeader: true }),
    Body(),
    async (ctx) => {
      console.log("Running api upsert shop")
      await upsertShop(ctx.request.body)
      ctx.body = ctx.request.body
      ctx.res.statusCode = 200
    }
  )

  router.get(
    "/api/get-css",
    verifyRequest({ returnHeader: true }),
    async (ctx) => {
      console.log("Running api get css")
      let { shop } = ctx.query
      // Todo finish auto extract method
      if (dev) shop = 'spotted-by-humphrey.myshopify.com'
      const shopName = shop.split('.')[0].replace('-staging', '')
      console.log('Getting css from', shopName)
      const css = fs.readFileSync(path.resolve(`./public/css/${shopName}.css`))
      ctx.body = css
      ctx.res.statusCode = 200
    }
  )

  router.get(
    "/api/get-order-records",
    verifyRequest({ returnHeader: true }),
    async (ctx) => {
      console.log("Running api get order records")
      const { shop, startDate, endDate } = ctx.query
      const orderRecords = await getOrderRecords({ shop, startDate, endDate })
      ctx.body = orderRecords
      ctx.res.statusCode = 200
    }
  )

  router.get(
    "/api/get-cart-counts",
    verifyRequest({ returnHeader: true }),
    async (ctx) => {
      console.log("Running api get cart counts")
      const { shop, startDate, endDate } = ctx.query
      const cartCounts = await getCartCounts({ shop, startDate, endDate })
      ctx.body = cartCounts
      ctx.res.statusCode = 200
    }
  )

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx) => {
      console.log("Running graphql")
      await shopify.Utils.graphqlProxy(ctx.req, ctx.res)
    }
  )

  // Shopify app proxy routes
  router.get("/proxy/settings", async (ctx) => {
    const session = await shopify.Utils.loadCurrentSession(
      ctx.req,
      ctx.res
    )
    const shop = ctx.query?.shop || session?.shop
    try {
      // Need to use offline token in proxy
      const accessToken = await getOfflineToken(shop)
      if (!accessToken) {
        console.log("Redirecting back to offline flow")
        return ctx.redirect(`/install/auth?shop=${shop}`)
      }
      // Use offline client in proxy
      const graphqlClient = new shopify.Clients.Graphql(shop, accessToken)
      const shopData = await graphqlClient.query({
        data: {
          query: shopQuery,
        }
      })
      const { privateMetafield } = shopData.body.data.shop

      const { customSettings } = JSON.parse(privateMetafield.value)

      ctx.body = customSettings

      ctx.res.statusCode = 200

    } catch (error) {
      await logError({ shop, error })

      ctx.body = new Error(error)

      ctx.res.statusCode = 500
    }

  })

  router.get("(/_next/static/.*)", handleRequest) // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest) // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const session = await shopify.Utils.loadCurrentSession(ctx.req, ctx.res)
    const shop = ctx.query?.shop || session?.shop
    if (!shop) return
    const active = await isShopActive(shop)

    if (!active) {
      // This shop hasn't been seen yet, go through OAuth to get an offline token
      return ctx.redirect(`/install/auth?shop=${shop}`)
    } else {
      if (session && session.expires && session.expires <= new Date()) {
        // Session has expired, go through OAuth to create a new session
        return ctx.redirect(`/auth?shop=${shop}`)
      } else {
        // Session is valid, go to app
        return await handleRequest(ctx, shop)
      }
    }
  })

  server.use(router.allowedMethods())
  server.use(router.routes())
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})

async function getOfflineToken(shop) {
  const client = await postgres.connect()
  try {
    const table = "shop"
    const query = `SELECT * FROM ${table} WHERE shop = $1`
    const result = await client.query(query, [shop])
    const row = result.rows[0]
    return row?.access_token
  } catch (error) {
    await logError({ shop, error })
  } finally {
    client.release()
  }
}

async function isShopActive(shop) {
  const client = await postgres.connect()
  try {
    console.log(shop)
    const table = "shop"
    const query = `SELECT * FROM ${table} WHERE shop = $1`
    const result = await client.query(query, [shop])
    const row = result.rows[0]
    if (row?.requires_update)
      console.log("Shop is active but requires update...")
    // Todo: Check if shop requires update without GraphQL request above
    return (
      row?.installed === true && row?.access_token && !row?.requires_update
    )
  } catch (error) {
    console.log("Error getting shop status: ", error)
    return false
  } finally {
    client.release()
  }
}

async function upsertShop(shop) {
  const date = new Date().toISOString()
  const shopWithDate = {
    ...shop,
    created_at: shop.created_at || date,
    updated_at: date
  }
  const client = await postgres.connect()
  try {
    const table = "shop"

    const keys = Object.keys(shopWithDate).filter((key) => {
      return shopWithDate[key] !== undefined
    })

    const columns = keys.join(", ")

    const names = keys
      .map((key, index) => {
        return key + " = $" + (index + 1)
      })
      .join(", ")

    const variables = keys
      .map((key, index) => {
        return "$" + (index + 1)
      })
      .join(", ")

    const values = keys.map((key) => {
      return shopWithDate[key]
    })

    const upsertQuery =
      "INSERT INTO " +
      table +
      " (" +
      columns +
      ") VALUES (" +
      variables +
      ") ON CONFLICT (id) DO UPDATE SET " +
      names

    await client.query(upsertQuery, values)
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    await logError({ shop: shopWithDate, error })
  } finally {
    client.release()
  }
}

async function upsertOrderRecord({ shop, orderRecord }) {
  const client = await postgres.connect()
  try {
    const table = "order_record"

    const keys = Object.keys(orderRecord).filter((key) => {
      return orderRecord[key] !== undefined
    })

    const columns = keys.join(", ")

    const names = keys
      .map((key, index) => {
        return key + " = $" + (index + 1)
      })
      .join(", ")

    const variables = keys
      .map((key, index) => {
        return "$" + (index + 1)
      })
      .join(", ")

    const values = keys.map((key) => {
      return orderRecord[key]
    })

    const upsertQuery =
      "INSERT INTO " +
      table +
      " (" +
      columns +
      ") VALUES (" +
      variables +
      ") ON CONFLICT (id) DO UPDATE SET " +
      names

    await client.query(upsertQuery, values)
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    await logError({ shop, error })
  } finally {
    client.release()
  }
}

async function upsertCartCount({ shop, cart }) {
  const day = cart.created_at.split("T")[0]
  const count = 1
  const selectQuery = `SELECT * FROM cart_count WHERE shop = $1 AND day = $2`
  const insertQuery =
    "INSERT INTO cart_count (shop, day, count) VALUES ($1, $2, $3)"
  const updateQuery =
    "UPDATE cart_count SET count = count + $3 WHERE shop = $1 AND day = $2"
  const values = [shop, day, count]
  const client = await postgres.connect()
  try {
    const selectRes = await client.query(selectQuery, [shop, day])
    if (selectRes.rows.length === 0) {
      await client.query(insertQuery, values)
      await client.query("COMMIT")
    } else {
      await client.query(updateQuery, values)
      await client.query("COMMIT")
    }
  } catch (error) {
    await client.query("ROLLBACK")
    await logError({ shop, error })
  } finally {
    client.release()
  }
}

async function getCartCounts({ shop, startDate, endDate }) {
  const startDay = startDate.split("T")[0]
  const endDay = endDate.split("T")[0]
  const selectQuery = `SELECT * FROM cart_count WHERE shop = $1 AND day >= $2 AND day <= $3`
  const values = [shop, startDay, endDay]
  const client = await postgres.connect()
  try {
    const selectRes = await client.query(selectQuery, values)
    return selectRes.rows
  } catch (error) {
    await logError({ shop, error })
  } finally {
    client.release()
  }
}

async function getOrderRecords({ shop, startDate, endDate }) {
  const selectQuery = `SELECT * FROM order_record WHERE shop = $1 AND created_at >= $2 AND created_at <= $3`
  const values = [shop, startDate, endDate]
  const client = await postgres.connect()
  try {
    const selectRes = await client.query(selectQuery, values)
    return selectRes.rows
  } catch (error) {
    await logError({ shop, error })
  } finally {
    client.release()
  }
}

async function checkTheme({ shop, accessToken, shopId }) {
  try {
    // Specify the name of the template the app will integrate with
    const APP_BLOCK_TEMPLATES = ["cart"]

    // Create a new client for the specified shop
    const client = new shopify.Clients.Rest(shop, accessToken)
    // Use `client.get` to request a list of themes on the shop
    const {
      body: { themes },
    } = await client.get({
      path: "themes",
    })
    // Find the published theme
    const publishedTheme = themes.find((theme) => theme.role === "main")
    // Retrieve a list of assets in the published theme
    const {
      body: { assets },
    } = await client.get({
      path: `themes/${publishedTheme.id}/assets`,
    })
    // Check if JSON template files exist for the template specified in APP_BLOCK_TEMPLATES
    const templateJSONFiles = assets.filter((file) => {
      return APP_BLOCK_TEMPLATES.some(
        (template) => file.key === `templates/${template}.json`
      )
    })
    if (templateJSONFiles.length === APP_BLOCK_TEMPLATES.length) {
      console.log("All desired templates support sections everywhere!")
    } else if (templateJSONFiles.length) {
      console.log(
        "Only some of the desired templates support sections everywhere."
      )
    }
    // Retrieve the body of JSON templates and find what section is set as `main`
    const templateMainSections = (
      await Promise.all(
        templateJSONFiles.map(async (file) => {
          // let acceptsAppBlock = false
          const {
            body: { asset },
          } = await client.get({
            path: `themes/${publishedTheme.id}/assets`,
            query: { "asset[key]": file.key },
          })

          const json = JSON.parse(asset.value)

          // Save sections for HeyThanks review
          if (json.sections) {
            await upsertShop({ id: shopId, cart_sections: json.sections })
          }

          const main = Object.entries(json.sections).find(
            ([id, section]) => id === "main" || section.type.startsWith("main-")
          )
          if (main) {
            return assets.find(
              (file) => file.key === `sections/${main[1].type}.liquid`
            )
          }
        })
      )
    ).filter((value) => value)

    // Request the content of each section and check if it has a schema that contains a
    // block of type '@app'
    const sectionsWithAppBlock = (
      await Promise.all(
        templateMainSections.map(async (file) => {
          let acceptsAppBlock = false
          const {
            body: { asset },
          } = await client.get({
            path: `themes/${publishedTheme.id}/assets`,
            query: { "asset[key]": file.key },
          })

          const match = asset.value.match(
            /\{%\s+schema\s+%\}([\s\S]*?)\{%\s+endschema\s+%\}/m
          )
          const schema = JSON.parse(match[1])

          if (schema && schema.blocks) {
            acceptsAppBlock = schema.blocks.some((b) => b.type === "@app")
          }

          return acceptsAppBlock ? file : null
        })
      )
    ).filter((value) => value)
    if (templateJSONFiles.length === sectionsWithAppBlock.length) {
      console.log(
        "All desired templates have main sections that support app blocks!"
      )
    } else if (sectionsWithAppBlock.length) {
      console.log("Only some of the desired templates support app blocks.")
    } else {
      console.log("None of the desired templates support app blocks")
    }
  } catch (error) {
    await logError({ shop, error })
  }
}

async function logError({ shop, error }) {
  shop = shop || 'webhook'
  error = error.message || error

  if (process.env.DEV_APP) {
    console.error(error)
  }
  const client = await postgres.connect()
  try {
    const id = randomUUID()
    const createdAt = new Date().toISOString()
    const table = "error"
    const query = `INSERT INTO ${table} (id, created_at, shop, error) VALUES ($1, $2, $3, $4)`
    await client.query(query, [id, createdAt, shop, error])
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    console.log("Error in error logger: ", error)
    throw error
  } finally {
    client.release()
  }
  try {
    await slack.send(`🙈 Error in ${shop} – ${error}`)
  } catch (error) {
    console.log("Error in slack notification: ", error)
  }
}
