import { gql } from "@apollo/client"

export const UPDATE_SCRIPT_TAG = gql`
    mutation scriptTagUpdate($id: ID!, $input: ScriptTagInput!) {
        scriptTagUpdate(id: $id, input: $input) {
            scriptTag {
                id
                src
            }
        }
    }
`