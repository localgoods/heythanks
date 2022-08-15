import ShopifyApi, { ApiVersion } from '@shopify/shopify-api'
import { GraphqlClient } from '@shopify/shopify-api/dist/clients/graphql'
import { RestClient } from '@shopify/shopify-api/dist/clients/rest'

/**
 * Client class for interacting with shopify api as a shop
 */
 export default class Shopify {
    embedded: boolean
    graphql: GraphqlClient
    rest: RestClient
    shop: any
    orders: any[]
    tipOrders: any[]
    constructor(domain: string, accessToken: string, embedded: boolean) {
        ShopifyApi.Context.initialize({
            API_KEY: process.env.SHOPIFY_API_KEY as string,
            API_SECRET_KEY: process.env.SHOPIFY_API_SECRET as string,
            SCOPES: process.env.SCOPES?.split(",") as string[],
            HOST_NAME: process.env.HOST.replace(/https:\/\//, "") as string,
            API_VERSION: ApiVersion.October21,
            IS_EMBEDDED_APP: embedded,
            SESSION_STORAGE: new ShopifyApi.Session.MemorySessionStorage()
        })
        this.embedded = embedded
        this.graphql = new ShopifyApi.Clients.Graphql(domain, accessToken)
        this.rest = new ShopifyApi.Clients.Rest(domain, accessToken)
    }

    async initialize() {
        this.shop = await this.fetchShop()
        if (!this.embedded) {
            this.orders = await this.fetchOrders()
            this.tipOrders = this.filterOrdersByItems(this.orders, { title: 'Fulfillment Tip' })
        }
        return this
    }

    async fetchShop() {
        const options = {
            path: 'shop'
        }
        const { body } = await this.rest.get(options)
        const { shop } = body
        return shop
    }
    
    async fetchOrders() {
        let options = {
            path: 'orders',
            query: {
                status: 'any',
                // created_at_min: '2022-08-05T16:00:00-05:00',
                created_at_min: '2022-07-31T13:00:00-05:00'
            }
        }
        const allOrders = []
        while (Object.keys(options || {}).length) {
            const { body, pageInfo } = await this.rest.get(options)
            console.log(body)
            const { orders } = body
            allOrders.push(...orders)
            options = pageInfo.nextPage
        }
        return allOrders
    }

    filterOrdersByItems(orders: any[], filter) {
        filter = filter || { title: 'Fulfillment Tip' }
        return orders.filter(({ line_items }) => line_items.find(item => {
            for (const key in filter) {
                if (filter[key] !== item[key] || !filter[key].includes(item[key])) return false
            }
            return true
        }))
    }
}
