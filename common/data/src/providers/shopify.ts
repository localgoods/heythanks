import ShopifyApi, { ApiVersion } from '@shopify/shopify-api'
import { GraphqlClient } from '@shopify/shopify-api/dist/clients/graphql'
import { RestClient } from '@shopify/shopify-api/dist/clients/rest'

/**
 * Client class for interacting with shopify api as a shop
 */
 export default class Shopify {
    #domain: string
    #accessToken: string
    #createdAt: string
    #graphql: GraphqlClient
    #rest: RestClient
    
    shop: any
    orders: any[]
    tipOrders: any[]

    constructor({ shop, access_token, created_at }) {
        ShopifyApi.Context.initialize({
            API_KEY: process.env.SHOPIFY_API_KEY as string,
            API_SECRET_KEY: process.env.SHOPIFY_API_SECRET as string,
            SCOPES: process.env.SCOPES?.split(",") as string[],
            HOST_NAME: process.env.HOST.replace(/https:\/\//, "") as string,
            API_VERSION: ApiVersion.October21,
            IS_EMBEDDED_APP: false,
            SESSION_STORAGE: new ShopifyApi.Session.MemorySessionStorage()
        })
        this.#domain = shop
        this.#accessToken = access_token
        this.#createdAt = created_at
        this.#graphql = new ShopifyApi.Clients.Graphql(this.#domain, this.#accessToken)
        this.#rest = new ShopifyApi.Clients.Rest(this.#domain, this.#accessToken)
    }

    async initialize() {
        this.shop = await this.fetchShop()
        this.orders = await this.fetchOrders()
        this.tipOrders = this.filterOrdersByItems({ title: 'Fulfillment Tip' })
        return this
    }

    async fetchShop() {
        const options = {
            path: 'shop'
        }
        const { body } = await this.#rest.get(options)
        const { shop } = body
        return shop
    }
    
    async fetchOrders() {
        let options = {
            path: 'orders',
            query: {
                status: 'any',
                created_at_min: this.#createdAt
            }
        }
        const allOrders = []
        while (Object.keys(options || {}).length) {
            const { body, pageInfo } = await this.#rest.get(options)
            const { orders } = body
            allOrders.push(...orders)
            options = pageInfo.nextPage
        }
        return allOrders
    }

    filterOrdersByItems(filter) {
        filter = filter || { title: 'Fulfillment Tip' }
        return this.orders.filter(({ line_items }) => line_items.find(item => {
            for (const key in filter) {
                if (filter[key] !== item[key] || !filter[key].includes(item[key])) return false
            }
            return true
        }))
    }
}
