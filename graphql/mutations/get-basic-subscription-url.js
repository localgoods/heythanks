import { gql } from "@apollo/client";

export const GET_BASIC_SUBSCRIPTION_URL = gql`
    mutation getBasicSubscriptionUrl($url: URL!, $test: Boolean!) {
        appSubscriptionCreate(
            name: "Basic Plan"
            returnUrl: $url
            test: $test
            lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                    price: { amount: 4.99, currencyCode: USD }
                }
              }
            }
            ]
        ) {
            userErrors {
              field
              message
            }
            confirmationUrl
            appSubscription {
              id
            }
          }
    }
`;
