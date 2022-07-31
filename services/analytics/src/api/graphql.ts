import { gql, GraphQLClient } from "graphql-request"
export default async function graphql(_req, _res) {
  const query = gql`
    {
      # To hide our test shops
      # shop(where: { plan_name: { _neq: "Developer Preview" } }) {
      shop {
        id
        name
        email
        shop
        fulfillment_service
        fulfillment_manual
        installed
        onboarded
        requires_update
        access_token
        active_plan
      }
    }
  `
  const endpoint = "http://localhost:8080/v1/graphql"
  const client = new GraphQLClient(endpoint, {
    headers: {
      "content-type": "application/json",
    },
  })
  const variables = {}
  const { shop } = await client.request(query, variables)
  return shop
}
