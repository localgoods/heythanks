import { gql } from "@apollo/client"

export const CREATE_SCRIPT_TAG = gql`
    mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
            scriptTag {
                id
                src
            }
        }
    }
`