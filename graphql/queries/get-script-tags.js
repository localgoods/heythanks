import { gql } from "@apollo/client"

export const GET_SCRIPT_TAGS = gql`
    query getScriptTags {
        scriptTags(first: 100) {
            edges {
                node {
                    id
                    src
                }
            }
        }
    }
`
