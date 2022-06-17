export const upsertPrivateMetafield = /* GraphQL */ `mutation upsertPrivateMetafield($input: PrivateMetafieldInput!) {
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
}`