import { ShopDictionary } from './interfaces/ShopDictionary'
import { AppDictionary } from './interfaces/AppDictionary'
import { Section } from './interfaces/Section'

const turboSections: Section[] = [
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_count",
        type: "update"
    },
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_items",
        type: "update"
    },
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_subtotal",
        type: "update"
    },
    {
        id: "#shopify-section-cart-template",
        section: "cart-template",
        selector: ".ten.columns",
        type: "update"
    },
    {
        id: "#shopify-section-cart-template",
        section: "cart-template",
        selector: ":scope .subtotal .cart_subtotal",
        type: "update"
    },
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ".cart_count",
        type: "empty"
    },
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ".cart_content",
        type: "empty"
    },
    {
        id: "#shopify-section-cart-template",
        section: "cart-template",
        selector: ".cart-section",
        type: "empty"
    }
]

const showcaseSections: Section[] = [
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ".cart-icon--basket2",
        type: "update"
    },
    {
        id: "[id*='shopify-section-template']",
        section: "main-cart",
        selector: ".cart-list",
        type: "update"
    },
    {
        id: "[id*='shopify-section-template']",
        section: "main-cart",
        selector: ":scope .under-cart .amount",
        type: "update"
    },
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ".cart-icon--basket2",
        type: "empty"
    },
    {
        id: "[id*='shopify-section-template']",
        section: "main-cart",
        selector: ".central.py-medium.content",
        type: "empty"
    }
]

export const shopDictionary: ShopDictionary = {
    // ScriptTag stores
    'spotted-by-humphrey': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo'
    },
    'urban-edc-supply': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo'
    },
    // AppBlock stores
    'shopwayre': {
        placementSelector: '#heythanks-data',
        cartSections: showcaseSections,
        wrapperClass: 'showcase'
    },
    // Local stores, update as needed
    'local-goods-ian-dev': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo'
    },
    'local-goods-shane-dev': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo'
    }
}

export const appDictionary: AppDictionary = {
    'heythanks-preview': null,
    'heythanks-full': null,
    'heythanks-mini-0': null,
    'heythanks-mini-1': null,
    'heythanks-mini-2': null,
    'heythanks-mini-3': null
}

export function getShop() {
    const storefront = (window as any).Shopify
    const shopUrl = storefront?.shop
    if (shopUrl) {            
        const shopName = shopUrl.split('.')[0].replace('-staging', '')
        return shopDictionary[shopName]
    }
}