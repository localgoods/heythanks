import "isomorphic-fetch";
import { gql } from '@apollo/client';

export function BASIC_RECURRING_CREATE(url) {
  return gql`
    mutation {
      appSubscriptionCreate(
          name: "Basic Plan"
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
    }`;
}

export const getBasicSubscriptionUrl = async ctx => {
  const { client } = ctx;
  const confirmationUrl = await client
    .mutate({
      mutation: BASIC_RECURRING_CREATE(process.env.HOST)
    })
    .then(response => response.data.appSubscriptionCreate.confirmationUrl);

  return ctx.redirect(confirmationUrl);
};
