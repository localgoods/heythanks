import { gql } from "@apollo/client"

export const UPSERT_PRIVATE_METAFIELD = gql`
    mutation upsertPrivateMetafield($input: PrivateMetafieldInput!) {
        privateMetafieldUpsert(input: $input) {
            userErrors {
                field
                message
            }
            privateMetafield {
                id
                key
                namespace
                value
                valueType
            }
        }
    }
`
