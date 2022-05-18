import { gql } from "@apollo/client"

export const CREATE_TIP_PRODUCT = gql`
    mutation createTipProduct($input: ProductInput!) {
        productCreate(input: $input) {
            userErrors { 
                field
                message
            }    
            product {
                id
                handle
            }
        }
    }
`
