import { ShopDictionary } from './interfaces/ShopDictionary'
import { AppDictionary } from './interfaces/AppDictionary'
import { Section } from './interfaces/Section'

const imgBucketUrl = 'https://storage.googleapis.com/heythanks-app-images'

const turboSections: Section[] = [
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_count",
    },
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_items",
    },
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ":scope .cart_container .cart_subtotal",
    },
    {
        id: "#shopify-section-cart-template",
        section: "cart-template",
        selector: ".ten.columns"
    },
    {
        id: "#shopify-section-cart-template",
        section: "cart-template",
        selector: ":scope .subtotal .cart_subtotal"
    }
]

const showcaseSections: Section[] = [
    {
        id: "#shopify-section-header",
        section: "header",
        selector: ".cart-icon--basket2",
    },
    {
        id: "[id*='shopify-section-template']",
        section: "main-cart",
        selector: ".cart-list"
    },
    {
        id: "[id*='shopify-section-template']",
        section: "main-cart",
        selector: ":scope .under-cart .amount"
    }
]

export const shopDictionary: ShopDictionary = {
    // ScriptTag stores
    'spotted-by-humphrey': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo',
        workerImg: `${imgBucketUrl}/Worker2.svg`
    },
    'urban-edc-supply': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo',
        workerImg: `${imgBucketUrl}/Worker2.svg`
    },
    // AppBlock stores
    'shopwayre': {
        placementSelector: '#heythanks-data',
        cartSections: showcaseSections,
        wrapperClass: 'showcase',
        workerImg: `${imgBucketUrl}/Worker.svg`
    },
    // Local stores, update as needed
    'local-goods-ian-dev': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo',
        workerImg: `${imgBucketUrl}/Worker2.svg`
    },
    'local-goods-shane-dev': {
        placementSelector: '.cart_subtotal',
        cartSections: turboSections,
        wrapperClass: 'turbo',
        workerImg: `${imgBucketUrl}/Worker2.svg`
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
    let shopUrl = storefront.shop
    if (!shopUrl) shopUrl = (new URL(document.referrer)).hostname
    const shopName = shopUrl.split('.')[0].replace('-staging', '')
    return shopDictionary[shopName]
}