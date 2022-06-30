import { Section } from "~/interfaces/Section"

export const sectionsToClear: Section[] = [
    {
        id: "shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_count",
    },
    {
        id: "shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_content"
    },
    {
        id: "shopify-section-cart-template",
        section: "cart-template",
        selector: ":scope #cart-form .ten.columns"
    }
]

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
        selector: ":scope .section.clearfix .ten.columns"
    },
    {
        id: "shopify-section-cart-template",
        section: "cart-template",
        selector: ":scope #cart-form .ten.columns"
    }
]