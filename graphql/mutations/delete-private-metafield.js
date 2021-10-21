import { gql } from "@apollo/client";

export const DELETE_PRIVATE_METAFIELD = gql`
    mutation deletePrivateMetafield($input: PrivateMetafieldDeleteInput!) {
        privateMetafieldDelete(input: $input) {
            userErrors {
                field
                message
            }
            deletedPrivateMetafieldId
        }
    }
`;