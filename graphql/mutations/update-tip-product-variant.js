import { gql } from "@apollo/client";

export const UPDATE_TIP_PRODUCT_VARIANT = gql`
    mutation updateTipProductVariant($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
            product {
                id
            }
            productVariant {
                id
                price
            }
            userErrors {
                field
                message
            }
        }
    }
`;