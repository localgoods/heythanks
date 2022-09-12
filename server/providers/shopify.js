import ShopifyApi, { ApiVersion } from '@shopify/shopify-api'

export default class Shopify {    
    constructor() {
        Object.assign(this, ShopifyApi)
        this.Context.initialize({
            API_KEY: process.env.SHOPIFY_API_KEY,
            API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
            SCOPES: process.env.SCOPES.split(","),
            HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
            API_VERSION: ApiVersion.October21,
            IS_EMBEDDED_APP: true,
            SESSION_STORAGE: new this.Session.MemorySessionStorage()
        })
    }
}