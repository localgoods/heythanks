import express from 'express'
import Shopify from '../lib/shopify'
import Postgres from '../lib/postgres'
const postgres = new Postgres()
const shopify = new Shopify()

export default async function shop(req: express.Request) {
  const { shop } = req.query
  const postgresClient = await postgres.connect()
  const shopsMeta = await postgresClient.query(`SELECT access_token FROM shop where shop = '${shop}'`)
  const accessToken = shopsMeta.rows.map((({ access_token }) => access_token))[0]
  return await getShop(shop as string, accessToken)
}

// Todo add pagination
// if (response.hasNext()) {
//   const nextPage = await response.next();
// }

export async function getShop(domain: string, accessToken: string) {
  const shopifyClient = shopify.rest(domain, accessToken)
  const [shopData, ordersData] = await Promise.all([
    await shopifyClient.get({
      path: 'shop',
      query: {
        limit: 250
      }
    }),
    await shopifyClient.get({
      path: 'orders',
      query: {
        limit: 250
      }
    })
  ])
  const { shop, errors: shopErrors } = (shopData.body as any)
  const { orders, errors: ordersErrors } = (ordersData.body as any)
  const tipOrders = orders?.filter(({ line_items }) => line_items.find(({ title }) => title === 'Fulfillment Tip'))
  if (orders.length) console.log('ORDERS', orders.length)
  if (tipOrders.length) console.log('TIPS', tipOrders.length)
  return { 
    data: { 
      ...(shop || {}), 
      orders: orders || [],
      tipOrders: tipOrders || []
    }, 
    errors: [
      ...(shopErrors || []), ...(ordersErrors || [])
    ] 
  }
}
