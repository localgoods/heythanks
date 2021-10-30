import { gql } from "@apollo/client";

export const GET_ORDERS = gql`
    query getOrders($query: String) {
        orders(first: 10, query: $query) {
            edges {
                cursor
                node {
                    id
                    createdAt
                    cancelledAt
                    name
                    lineItems(first: 5) {
                        edges {
                            cursor
                            node {
                                id
                                title
                                quantity
                                originalUnitPrice
                            }
                        }
                        pageInfo {
                            hasNextPage
                            hasPreviousPage
                        }
                    }
                }
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
            }
        }
    }
`;
