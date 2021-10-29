import { gql } from "@apollo/client";

export const GET_ORDERS = gql`
    query getOrders($query: String) {
        orders(query: $query, first: 1) {
            edges {
                cursor
                node {
                    id
                    name
                    createdAt
                    lineItems(first: 2) {
                        edges {
                            node {
                                title
                                quantity
                            }
                        }
                    }
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
`;