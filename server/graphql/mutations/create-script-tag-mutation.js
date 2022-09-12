export const createScriptTagMutation = /* GraphQL */ `mutation createScriptTag($input: ScriptTagInput!) {
    scriptTagCreate(input: $input) {
        scriptTag {
            id
            src
        }
    }
}`