import { gql } from "@apollo/client";

export const GET_APP_CREDITS = gql`
    query getAppCredits {
        appInstallation {
            credits(first: 100) {
                edges {
                    node {
                        createdAt
                        description
                        id
                        amount {
                            amount
                            currencyCode
                        }
                    }
                }
            }
        }
    }
`;