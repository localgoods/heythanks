import { Section } from "~/interfaces/Section"

export const sectionsToRefresh: Section[] = [
    {
        id: "shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_count",
    },
    {
        id: "shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_items",
    },
    {
        id: "shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_subtotal",
    },
    {
        id: "shopify-section-cart-template",
        section: "cart-template",
        selector: ".ten.columns"
    },
    {
        id: "shopify-section-cart-template",
        section: "cart-template",
        selector: ":scope .subtotal .cart_subtotal"
    }
]