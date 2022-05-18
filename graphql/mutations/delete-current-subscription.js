import { gql } from "@apollo/client"

export const DELETE_CURRENT_SUBSCRIPTION = gql`
    mutation deleteCurrentSubscription($id: ID!) {
        appSubscriptionCancel(id: $id) {
            userErrors {
                field
                message
            }
            appSubscription {
                id
                name
                status
            }
        }
    }
`