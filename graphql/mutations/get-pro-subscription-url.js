import { gql } from "@apollo/client";

export const GET_PRO_SUBSCRIPTION_URL = gql`
    mutation getProSubscriptionUrl($url: URL!, $test: Boolean!) {
        appSubscriptionCreate(
            name: "Pro Plan"
            trialDays: 14
            returnUrl: $url
            test: $test
            lineItems: [
            {
              plan: {
                appUsagePricingDetails: {
                    cappedAmount: { amount: 10000, currencyCode: USD }
                    terms: "Additional fees will only be charged in the amount of your total tips each month to send them to your fulfillment workers"
                }
              }
            }
            {
              plan: {
                appRecurringPricingDetails: {
                    price: { amount: 19.99, currencyCode: USD }
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
