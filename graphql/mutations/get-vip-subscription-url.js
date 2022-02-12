import { gql } from "@apollo/client";

export const GET_VIP_SUBSCRIPTION_URL = gql`
    mutation getVipSubscriptionUrl($url: URL!, $test: Boolean!) {
        appSubscriptionCreate(
            name: "VIP Plan"
            returnUrl: $url
            test: $test
            lineItems: [
            {
              plan: {
                appUsagePricingDetails: {
                    cappedAmount: { amount: 10000, currencyCode: USD }
                    terms: "Additional fees will only be charged in the exact amount of the total tips generated each month, and will be sent in their entirety to the fulfillment workers who earned them."
                }
              }
            }
            {
              plan: {
                appRecurringPricingDetails: {
                    price: { amount: 0.00, currencyCode: USD }
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