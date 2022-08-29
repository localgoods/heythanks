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
  shopsData.forEach(({ shop, orders, tipOrders, lTipOrders, xlTipOrders, tipTotal }) => {
    console.log(`\u0332${shop.name}`)
    console.log('- Order count:', orders.length)
    console.log('- Tip count:', tipOrders.length)
    console.log('- Tip rate:', `${((tipOrders.length / orders.length) * 100).toFixed(2)}%`)
    console.log('- L tip count:', lTipOrders.length)
    console.log('- XL tip count:', xlTipOrders.length)
    console.log('- Tip total:', `$${tipTotal.toFixed(2)}`)
    console.log('- Revenue:', `$${(tipTotal * 0.029 + tipOrders.length * 0.30).toFixed(2)}`)
    console.log('---')
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