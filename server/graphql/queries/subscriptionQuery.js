export const subscriptionQuery = `query($id: ID!) {
    node(id: $id) {
        ...on AppSubscription {
            id
            lineItems {
                id
                plan {
                    pricingDetails {
                        ...on AppRecurringPricing {
                                interval
                                price {
                                amount
                                currencyCode
                            }
                        }
                        ...on AppUsagePricing {
                            terms
                            cappedAmount {
                                amount
                                currencyCode
                            }
                            balanceUsed {
                                amount
                                currencyCode
                            }
                        }
                    }
                }
            }
        }
    }
}`