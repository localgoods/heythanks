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
                        appRecurringPricingDetails: {
                            price: { amount: 49.99, currencyCode: USD }
                        }
                    }
                }
            ]
            trialDays: 365
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