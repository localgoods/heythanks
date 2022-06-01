import { gql } from "@apollo/client"

export const GET_SHOP_INFO = gql`
  query getShopInfo {
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
  }
`
