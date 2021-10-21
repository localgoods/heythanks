import { gql } from "@apollo/client";

export const GET_BASIC_SUBSCRIPTION_URL = gql`
    mutation getBasicSubscriptionUrl($url: URL!) {
        appSubscriptionCreate(
            name: "Basic Plan"
            trialDays: 14
            returnUrl: $url
            test: ${process.env.NODE_ENV !== "production" || $url.includes("local-goods")}
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
