export const createUsageMutation = /* GraphQL */ `mutation appUsageRecordCreate($description: String!, $price: MoneyInput!, $subscriptionLineItemId: ID!) {
    appUsageRecordCreate(description: $description, price: $price, subscriptionLineItemId: $subscriptionLineItemId) {
        userErrors {
            field
            message
        }
        appUsageRecord {
            id
            createdAt
            description
        }
    }
}`