import Shopify from '@shopify/shopify-api'
import { ApiVersion } from '@shopify/shopify-api'
import { shopQuery } from './lib/graphql'
import { PgPool } from './lib/postgres'

const pgPool = new PgPool()

async function main() {
    Shopify.Context.initialize({
        API_KEY: process.env.SHOPIFY_API_KEY,
        API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
        SCOPES: process.env.SCOPES.split(","),
        HOST_NAME: 'heythanks.io',
        API_VERSION: ApiVersion.July22,
        IS_EMBEDDED_APP: false,
        SESSION_STORAGE: new Shopify.Session.MemorySessionStorage()
    })
    const pgClient = await pgPool.connect()
    const shops = await pgClient.query(`SELECT * FROM shop`)
    for (const meta of shops.rows) {
        const host = meta.shop
        const accessToken = meta.access_token
        const shop = await getShop(host, accessToken)
        console.log(shop)
    }
}

async function getShop(domain: string, accessToken: string) {
    const graphqlClient = new Shopify.Clients.Graphql(domain, accessToken)
    const shopData = await graphqlClient.query({
        data: {
            query: shopQuery,
        }
    })
    const { shop } = (shopData.body as any).data
    return shop
}

main()