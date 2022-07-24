import Shopify from '@shopify/shopify-api'
import { ApiVersion } from '@shopify/shopify-api'
import { shopQuery } from './graphql/shop-query'

async function main() {
    const apiKey = process.env.SHOPIFY_API_KEY
    const apiSecretKey = process.env.SHOPIFY_API_SECRET
    const scopes = process.env.SCOPES.split(",")
    const host = process.env.HOST
    const accessToken = process.env.SHOP_ACCESS_TOKEN

    Shopify.Context.initialize({
        API_KEY: apiKey,
        API_SECRET_KEY: apiSecretKey,
        SCOPES: scopes,
        HOST_NAME: host,
        API_VERSION: ApiVersion.July22,
        IS_EMBEDDED_APP: false
    })

    const graphqlClient = new Shopify.Clients.Graphql(host, accessToken)
    const shopData = await graphqlClient.query({
        data: {
            query: shopQuery,
        }
    })

    const { shop } = (shopData.body as any).data

    console.log(shop)
}

main()