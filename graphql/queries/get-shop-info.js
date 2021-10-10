import { gql } from "@apollo/client";

export const GET_SHOP_INFO = gql`
  query {
    shop {
      name
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
    }
  }
`;
