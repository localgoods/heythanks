import { gql } from "@apollo/client"

export const GET_CURRENT_SUBSCRIPTION = gql`
    query getCurrentSubscription {
        appInstallation {
            activeSubscriptions {
                id
                name
                status
                lineItems {
                    id
                }
            }
        }
    }
`