export const createCreditMutation = `mutation appCreditCreate($amount: MoneyInput!, $description: String!, $test: Boolean!) {
    appCreditCreate(amount: $amount, description: $description, test: $test) {
        userErrors {
            field
            message
        }
        appCredit {
            id
            createdAt
            description
        }
    }
}`