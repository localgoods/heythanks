export const shopQuery = /* GraphQL */ `query {
    shop {
        id
        privateMetafield(namespace: "heythanks", key: "shop") {
            namespace
            key
            value
            valueType
        }
    }
}`