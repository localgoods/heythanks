import { ApolloClient } from "@apollo/client";

export const createClient = (shop, accessToken) => {
  return new ApolloClient({
    uri: `https://${shop}/admin/api/2021-07/graphql.json`,
    request: operation => {
      operation.setContext({
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "User-Agent": `heythanks ${
            process.env.npm_package_version
          } | Shopify App CLI`
        }
      });
    }
  });
};
