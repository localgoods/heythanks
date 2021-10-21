import { gql } from "@apollo/client";

export const DELETE_TIP_PRODUCT = gql`
    mutation deleteTipProduct($input: ProductDeleteInput!) {
        productDelete(input: $input) {
            userErrors { 
                field
                message
            }    
            deletedProductId
        }
    }
`;