import { gql } from "@apollo/client";

export const GET_PRODUCT_BY_HANDLE = gql`
    query getProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
            id
            variants(first: 2) {
                edges {
                    node {
                        id
                        price
                    }
                }
            }    
        }
    }
`;