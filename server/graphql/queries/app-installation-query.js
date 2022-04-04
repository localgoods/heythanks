export const appInstallationQuery = /* GraphQL */ `query{
    appInstallation {
        activeSubscriptions {
            id
            name
            status
            currentPeriodEnd
        }
    }
}`