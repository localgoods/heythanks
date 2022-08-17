import Postgres from './providers/postgres'
import Shop from './providers/shop'
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
  const operations = shopsMeta.map(async shopMeta => await getShop(shopMeta))
  const shopsData =  await Promise.all(operations)
  shopsData.forEach((shop, index) => {
    console.log(`\u0332${shop.shop.name}`)
    console.log('Orders')
    console.log('- Order count:', shop.orders.length)
    console.log('- Tip count:', shop.tipOrders.length)
    console.log('- L tip count:', shop.lTipOrders.length)
    console.log('- XL tip count:', shop.xlTipOrders.length)
    console.log('- Tip total:', `$${shop.tipTotal}`)
    if (index < shopsData.length - 1) console.log('---')
  })
  return shopsData
}

export async function getShopsMeta() {
  const poolClient = await postgres.connect()
  const shopMeta = await poolClient.query(`SELECT * FROM shop`)
  poolClient.release()
  return shopMeta.rows.filter(({ shop, access_token }) => !hiddenShops.includes(shop) && !!access_token)
}

export async function getShop(shopMeta: { shop: string; access_token: string; created_at: string }) {
  const shop = new Shop(shopMeta)
  return await shop.initialize()
}

processShops()