import "isomorphic-fetch";
import { gql } from '@apollo/client';

export function PRO_RECURRING_CREATE(url) {
  return gql`
    mutation {
      appSubscriptionCreate(
          name: "Pro Plan"
          returnUrl: "${url}"
          test: true
          lineItems: [
          {
            plan: {
              appUsagePricingDetails: {
                  cappedAmount: { amount: 10000, currencyCode: USD }
                  terms: "Customer tips to fulfillment workers"
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
    }`;
}

export const getProSubscriptionUrl = async ctx => {
  const { client } = ctx;
  const confirmationUrl = await client
    .mutate({
      mutation: PRO_RECURRING_CREATE(process.env.HOST)
    })
    .then(response => response.data.appSubscriptionCreate.confirmationUrl);

  return ctx.redirect(confirmationUrl);
};
