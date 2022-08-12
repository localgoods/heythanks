import Shopify, { ApiVersion } from '@shopify/shopify-api'
import { GraphqlClient } from '@shopify/shopify-api/dist/clients/graphql'

/**
 * Client class for interacting with shopify api
 */
 export default class ShopifyClient {
    private api: typeof Shopify
    constructor() {
        Shopify.Context.initialize({
            API_KEY: process.env.SHOPIFY_API_KEY as string,
            API_SECRET_KEY: process.env.SHOPIFY_API_SECRET as string,
            SCOPES: process.env.SCOPES?.split(",") as string[],
            HOST_NAME: 'heythanks.io',
            API_VERSION: ApiVersion.October21,
            IS_EMBEDDED_APP: false,
            SESSION_STORAGE: new Shopify.Session.MemorySessionStorage()
        })
        this.api = Shopify
    }

    graphql(domain: string, accessToken: string): GraphqlClient {
        return new this.api.Clients.Graphql(domain, accessToken)
    }
}

export const shopQuery = /* GraphQL */ `query {
    shop {
        id
        name
        url
        email
        billingAddress {
            formatted
        }
        plan {
            displayName
            partnerDevelopment
            shopifyPlus
        }
        myshopifyDomain
        fulfillmentServices {
            handle
            serviceName
            type
            location {
                name
                address {
                    formatted
                    phone
                }
            }
        }
        privateMetafield(namespace: "heythanks", key: "shop") {
            namespace
            key
            value
            valueType
        }
    }
    # orders(first: 100) {
    #     edges {
    #         node {
    #             id
    #             lineItems(first: 100) {
    #                 edges {
    #                     node {
    #                         id
    #                         title
    #                     }
    #                 }
    #             }
    #         }
    #     }
    # }
}`