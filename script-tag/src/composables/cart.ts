import { Ref, onMounted, ref, watch } from 'vue'

export type Settings = {
    // Emoji Options
    firstEmoji: string;
    secondEmoji: string;

    // Style Options
    backgroundColor: string;
    selectionColor: string;
    strokeColor: string;
    strokeWidth: number;
    cornerRadius: number;

    // Text Options
    labelText: string;
    tooltipText: string;

    // Visibility
    displayStatus: boolean;

    // Price Options
    firstPrice: number;
    secondPrice: number;

}

export type Section = {
    id: string;
    section: string;
    selector: string;
}

export const defaultSettings = {
    // Emoji Options
    firstEmoji: "🙂",
    secondEmoji: "🥰",

    // Style Options
    backgroundColor: "#ffffff",
    selectionColor: "#3678b4",
    strokeColor: "#d9d9d9",
    strokeWidth: 2,
    cornerRadius: 2,

    // Text Options
    labelText: "Send a tip directly to your fulfillment workers 💜",
    tooltipText: "HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order.",

    // Visibility
    displayStatus: true,

    // Price Options
    firstPrice: 100,
    secondPrice: 500
}

const tip: Tip = {
    option: undefined,
    setOption: (option?: string) => {
        const prevOption = tip.option
        if (prevOption !== option) {
            document.querySelectorAll(`#${prevOption}`).forEach(element => {
                (element as HTMLInputElement).checked = false
            })
        }
        if (option) {
            document.querySelectorAll(`#${option}`).forEach(element => {
                (element as HTMLInputElement).checked = true
            })
        }
        tip.option = option
    }
}

const settings: Ref<Settings> = ref(defaultSettings)
const cart: Ref<any> = ref()
const product: Ref<any> = ref()
const settingsLoading: Ref<boolean> = ref(false)

export default function useCart(outerSettings: Ref<Settings>) {

    watch(outerSettings, (newValue) => {
        settings.value = {
            ...settings.value,
            ...newValue
        }
    })

    async function fetchSettings() {
        const url = window.Shopify ? "/apps/heythanks/settings" : "/proxy/settings"
        const params = { method: "GET" }
        const response = await fetch(url, params)
        return await response.json()
    }

    async function fetchCart() {
        const url = '/cart.js'
        const params = { method: 'GET' }
        const response = await fetch(url, params)
        return await response.json()
    }

    async function fetchProduct() {
        const url = "/products/fulfillment-tip.js"
        const params = { method: "GET" }
        const response = await fetch(url, params)
        return await response.json()
    }

    onMounted(async () => {
        settingsLoading.value = true
        if (window.Shopify) {
            const [currentSettings, currentCart, currentProduct] = await Promise.all([fetchSettings(), fetchCart(), fetchProduct()])

            cart.value = currentCart
            product.value = currentProduct
            const { variants } = product.value
            const [firstPrice, secondPrice] = variants.map((variant: TipVariant) => variant.price)

            settings.value = {
                ...defaultSettings,
                ...currentSettings,
                firstPrice,
                secondPrice
            }
        } else {

            settings.value = {
                ...defaultSettings,
                ...outerSettings.value
            }
        }
        settingsLoading.value = false
    })

    return {
        settingsLoading,
        tip,
        settings,
        cart,
        product,
        fetchSettings,
        fetchCart,
        fetchProduct
    }
}