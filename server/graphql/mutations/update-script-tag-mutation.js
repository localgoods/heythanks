
export const updateScriptTagMutation = /* GraphQL */ `mutation updateScriptTag($id: ID!, $input: ScriptTagInput!) {
    scriptTagUpdate(id: $id, input: $input) {
        scriptTag {
            id
            src
        }
    }
}`