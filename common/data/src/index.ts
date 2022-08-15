import Postgres from './providers/postgres'
import Shopify from './providers/shopify'
const postgres = new Postgres()

const hiddenShops = [
  'hanging-with-the-kiddos.myshopify.com', 
  'urban-edc-supply-staging.myshopify.com', 
  'spotted-by-humphrey-staging.myshopify.com', 
  'loop-chocolate.myshopify.com', 
  'appstoretest8.myshopify.com', 
  'shopwayre-staging.myshopify.com'
]

export async function processShops() {
  const shopsMeta = await getShopsMeta()
  const operations = shopsMeta.map(async ({ shop, access_token }) => await getShop(shop, access_token))
  const shopsData =  await Promise.all(operations)
  return shopsData
}

export async function getShopsMeta() {
  const poolClient = await postgres.connect()
  const shopMeta = await poolClient.query(`SELECT * FROM shop`)
  poolClient.release()
  return shopMeta.rows.filter(({ shop, access_token }) => !hiddenShops.includes(shop) && !!access_token)
}

export async function getShop(domain: string, accessToken: string) {
  console.log('Getting shop at', domain)
  const shopify = await (new Shopify(domain, accessToken, false)).initialize()
  if (shopify.orders.length) console.log('ORDERS COUNT', shopify.orders.length)
  if (shopify.tipOrders.length) console.log('TIPS COUNT', shopify.tipOrders.length)
  return { 
    data: { 
      ...(shopify.shop || {}), 
      orders: shopify.orders || [],
      tipOrders: shopify.tipOrders || []
    }
  }
}

processShops().then(() => console.log('DONE'))