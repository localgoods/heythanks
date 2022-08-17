import ShopifyApi, { ApiVersion } from '@shopify/shopify-api'
import { RestClient } from '@shopify/shopify-api/dist/clients/rest'

/**
 * Client class for interacting with shopify api as a shop
 */
export default class Shop {
    #domain: string
    #accessToken: string
    #createdAt: string
    #shopify: RestClient

    shop: any
    orders: any[] = []
    tipOrders: any[] = []
    lTipOrders: any[] = []
    xlTipOrders: any[] = []
    tipTotal = 0

    constructor({ shop, access_token, created_at }: { shop: string; access_token: string; created_at: string }) {
        ShopifyApi.Context.initialize({
            API_KEY: process.env.SHOPIFY_API_KEY as string,
            API_SECRET_KEY: process.env.SHOPIFY_API_SECRET as string,
            SCOPES: process.env.SCOPES?.split(",") as string[],
            HOST_NAME: process.env.HOST?.replace(/https:\/\//, "") as string,
            API_VERSION: ApiVersion.October21,
            IS_EMBEDDED_APP: false,
            SESSION_STORAGE: new ShopifyApi.Session.MemorySessionStorage()
        })
        this.#domain = shop
        this.#accessToken = access_token
        this.#createdAt = created_at
        this.#shopify = new ShopifyApi.Clients.Rest(this.#domain, this.#accessToken)
    }

    async initialize() {
        this.shop = await this.fetchShop()
        this.orders = await this.fetchOrders()
        this.tipOrders = this.getTipOrders()
        this.lTipOrders = this.getLTipOrders()
        this.xlTipOrders = this.getXlTipOrders()
        this.tipTotal = this.getTipTotal()
        return this
    }

    async fetchShop() {
        const options = {
            path: 'shop'
        }
        const { body } = await this.#shopify.get(options)
        const { shop } = body as any
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            /* @ts-ignore */
            const { body, pageInfo } = await this.#shopify.get(options)
            const { orders } = body as any
            allOrders.push(...orders)
            options = pageInfo.nextPage
        }
        return allOrders
    }

    getTipOrders() {
        return this.orders.filter(({ line_items }) => line_items.find((item: { [x: string]: any }) => item.title === 'Fulfillment Tip'))
    }

    getLTipOrders() {
        return this.tipOrders.filter(({ line_items }) => line_items.find((item: { [x: string]: any }) => item.name.includes(' - L')))
    }

    getXlTipOrders() {
        return this.tipOrders.filter(({ line_items }) => line_items.find((item: { [x: string]: any }) => item.name.includes(' - XL')))
    }

    getTipTotal() {
        return this.tipOrders.reduce((acc, { line_items }) => acc + parseInt(line_items.find((item: { [x: string]: any }) => item.title === 'Fulfillment Tip').price), 0)
    }
}
