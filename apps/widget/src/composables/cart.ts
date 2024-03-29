import { Ref, onMounted, ref, watch } from 'vue'
import { Settings } from '@/interfaces/Settings'
import { Tip } from '@/interfaces/Tip'
import { Section } from '@/interfaces/Section'

export const defaultSettings = {
    // Style Options
    backgroundColor: "#ffffff",
    selectionColor: "#3678b4",
    strokeColor: "#d9d9d9",
    strokeWidth: 2,
    cornerRadius: 10,

    // Text Options
    labelText: "Send a tip directly to our fulfillment team who packs your order with care.",

    // Visibility
    displayStatus: false,

    // Price Options
    firstPrice: 1.00,
    secondPrice: 5.00
}

const tip: Ref<Tip> = ref({ id: '' })
const settings: Ref<Settings> = ref(defaultSettings)
const cart: Ref<any> = ref()
const product: Ref<any> = ref()
const settingsLoading: Ref<boolean> = ref(false)

interface CartOptions {
    passedSettings?: Ref<Settings>
    cartSections?: Section[]
}

export default function useCart({ passedSettings, cartSections }: CartOptions) {

    watch(passedSettings as Ref<Settings>, (newValue) => {
        const newSettings = {
            ...settings.value,
            ...newValue
        }
        if (!cartSections?.length) settings.value = newSettings
    })

    function setTip(option: Tip) {
        const prevOption = tip.value
        if (prevOption.id && prevOption.id !== option.id) {
            console.log('Setting', prevOption.id, 'to', false)
            document.querySelectorAll(`#${prevOption.id}`).forEach(element => {
                (element as HTMLInputElement).checked = false
            })
        }
        if (option.id) {
            console.log('Setting', option.id, 'to', true)
            document.querySelectorAll(`#${option.id}`).forEach(element => {
                (element as HTMLInputElement).checked = true
            })
        }
        tip.value = option
    }

    async function fetchSettings() {
        const url = cartSections?.length ? "/apps/heythanks/settings" : "/proxy/settings"
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
        if (cartSections?.length) {

            // Current settings is from proxy (ScriptTag)
            const [currentSettings, currentCart, currentProduct] = await Promise.all([fetchSettings(), fetchCart(), fetchProduct()])
            cart.value = currentCart
            product.value = currentProduct

            // Passed settings are from the app (Settings) or from theme (App Block)
            const newSettings = passedSettings?.value ? passedSettings?.value : currentSettings

            // We store the tip option data in our product variants
            const { variants } = product.value
            const [firstPrice, secondPrice] = variants.map((variant: Tip) => variant.price as number / 100)

            settings.value = {
                ...defaultSettings,
                ...newSettings,
                firstPrice,
                secondPrice
            }
        } else {

            const currentSettings = passedSettings?.value

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