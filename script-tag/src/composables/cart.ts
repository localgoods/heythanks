import { Ref, onMounted, ref, watch } from 'vue'
import { Settings } from '~/interfaces/Settings'
import { Tip } from '~/interfaces/Tip'

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

const tip: Ref<Tip> = ref({ id: '' })
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

    function setTip(option: Tip) {
        const prevOption = tip.value
        if (prevOption.id && prevOption.id !== option.id) {
            document.querySelectorAll(`#${prevOption.id}`).forEach(element => {
                (element as HTMLInputElement).checked = false
            })
        }
        if (option.id) {
            document.querySelectorAll(`#${option.id}`).forEach(element => {
                (element as HTMLInputElement).checked = true
            })
        }
        tip.value = option
    }

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

            // We store the tip option data in our product variants
            const { variants } = product.value
            const [firstPrice, secondPrice] = variants.map((variant: Tip) => variant.price)

            settings.value = {
                ...defaultSettings,
                ...currentSettings,
                firstPrice,
                secondPrice
            }
        } else {

            const currentSettings = outerSettings.value

            settings.value = {
                ...defaultSettings,
                ...currentSettings
            }
        }
        settingsLoading.value = false
    })

    return {
        tip,
        setTip,
        settingsLoading,
        settings,
        cart,
        product,
        fetchSettings,
        fetchCart,
        fetchProduct
    }
}