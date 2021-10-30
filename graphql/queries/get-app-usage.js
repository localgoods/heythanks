import { gql } from "@apollo/client";

export const GET_APP_USAGE = gql`
  query getAppUsage($id: ID!) {
    node(id: $id) {
      ... on AppSubscription {
        id
        lineItems {
          id
          plan {
            pricingDetails {
              ... on AppRecurringPricing {
                interval
                price {
                  amount
                  currencyCode
                }
              }
              ... on AppUsagePricing {
                terms
                cappedAmount {
                  amount
                  currencyCode
                }
                balanceUsed {
                  amount
                  currencyCode
                }
                
              }
            }
          }
          usageRecords(first: 100) {
            edges {
              node {
                createdAt
                description
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;
