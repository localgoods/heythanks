export const appInstallationQuery = `query{
    appInstallation {
        activeSubscriptions {
            id
            name
            status
            currentPeriodEnd
        }
    }
}`