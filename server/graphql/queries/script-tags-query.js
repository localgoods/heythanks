export const scriptTagsQuery = /* GraphQL */ `query scriptTags {
    scriptTags(first: 100) {
        edges {
            node {
                id
                src
            }
        }
    }
    
}`