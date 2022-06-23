import { Ref, onMounted, ref } from 'vue'

const defaultSettings = {
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

    // Price Options
    firstPrice: 100,
    secondPrice: 500,
    show: true,
    cartType: "full"
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

export default function useCart() {
    const settings: Ref<TipSettings> = ref(defaultSettings)
    const cart: Ref<any> = ref({})
    const product: Ref<any> = ref({})

    const fetchCart = async () => {
        const url = '/cart.js'
        const params = { method: 'GET' }
        const response = await fetch(url, params)
        return await response.json()
    }

    const fetchProduct = async () => {
        const url = "/products/fulfillment-tip.js"
        const params = { method: "GET" }
        const response = await fetch(url, params)
        return await response.json()
    }

    const fetchCustomSettings = async () => {
        const url = "/apps/heythanks/settings"
        const params = { method: "GET" }
        const response = await fetch(url, params)
        return await response.json()
    }

    onMounted(async () => {
        cart.value = await fetchCart()
        product.value = await fetchProduct()
        const { variants } = product.value
        const [firstPrice, secondPrice] = variants.map((variant: TipVariant) => variant.price)
        const customSettings = await fetchCustomSettings()
        const show = customSettings.displayStatus

        settings.value = {
            ...defaultSettings,
            firstPrice,
            secondPrice,
            ...customSettings,
            show
        }   
    })

    return {
        tip,
        cart,
        product,
        settings,
        fetchCart,
        fetchProduct
    }
}