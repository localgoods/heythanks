import { Ref, onMounted, ref, onUnmounted } from 'vue'

declare global {
    interface Window {
        Shopify: any;
    }
}

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

export default function useTips() {

    const mountedIds: Ref<string[]> = ref([])
    let ticking = false
    let observer: MutationObserver | null = null
    const widget: Ref<HTMLDivElement | null> = ref(null)
    const radio1: Ref<HTMLInputElement | null> = ref(null)
    const radio2: Ref<HTMLInputElement | null> = ref(null)
    const tooltipText: Ref<HTMLSpanElement | null> = ref(null)
    const settings: Ref<TipSettings> = ref(defaultSettings)
    const cart: Ref<any> = ref({})
    const product: Ref<any> = ref({})
    const tipOption: Ref<HTMLInputElement | null> = ref(null)
    const tipOptionLoading = ref(false)

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
        try {
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

            setupLoadListener()
            setupObserver()
            setupScrollListener()
            setupCart()
            
        } catch (error) {
            console.log('Error in cart onmounted: ', error)
        }
    })

    onUnmounted(() => {
        if (observer) {
            observer.disconnect()
        }
    })

    /**
     * Sets tip option from radio selection on click or keyup event
     * 
     * @param event {Event} Click or keyup event
     * @returns {void} 
     */
    async function setTipOption(event: KeyboardEvent | MouseEvent): Promise<void> {

        try {
            tipOptionLoading.value = true

            const tipOptionElement = event.target as HTMLInputElement

            if ((event as KeyboardEvent).keyCode) {
                tipOptionElement.checked = (event as KeyboardEvent).keyCode !== 32
            }
            tipOptionElement.checked = tipOption.value !== tipOptionElement

            const prevTipOptionId = tipOption.value?.id
            if (tipOptionElement.checked) {
                tipOption.value = tipOptionElement
            } else {
                tipOption.value = null
            }
            const currentTipOptionId = tipOption.value?.id

            if (prevTipOptionId) {
                cart.value = await removeTipFromCart(parseInt(prevTipOptionId.split("-")[1]))
            }
            if (currentTipOptionId) {
                cart.value = await addTipToCart(parseInt(currentTipOptionId.split("-")[1]))
            }
            if (prevTipOptionId || currentTipOptionId) {
                refreshCart()
            }

            tipOptionLoading.value = false
        } catch (error) {
            console.log('Error in setTipOption: ', error)
        }
    }

    async function addTipToCart(tipOptionNumber: number): Promise<void> {
        await fetch("/cart/clear.js", { method: "POST" })
        const currentItems = cart.value.items as { id: string, quantity: number }[]
        const tipId = product.value.variants[tipOptionNumber - 1].id
        const formData = {
            items: [
                {
                    id: tipId,
                    quantity: 1,
                },
                ...currentItems,
            ],
            sections: getSectionsToRender().map((section: { section: any }) => section.section),
            sections_url: window.location.pathname,
        }
        const url = "/cart/add.js"
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(formData),
        }
        const response = await fetch(url, params)
        return await response.json()
    }

    async function removeTipFromCart(tipOptionNumber: number) {
        const tipId = product.value.variants[tipOptionNumber - 1].id
        const formData = {
            updates: { [tipId]: 0 },
            sections: getSectionsToRender().map((section: { section: any }) => section.section),
            sections_url: window.location.pathname,
        }
        const url = "/cart/update.js"
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(formData),
        }
        const response = await fetch(url, params)
        return await response.json()
    }

    function getSectionsToRender(): CartSection[] {
        return [
            {
                id: "shopify-section-header",
                section: "header",
                selector: ".cart_items",
            },
            {
                id: "shopify-section-cart-template",
                section: "cart-template",
                selector: ".ten.columns"
            }
        ]
    }

    function setupLoadListener(this: any) {
        try {
            const open = window.XMLHttpRequest.prototype.open
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            window.XMLHttpRequest.prototype.open = function () {
                this.addEventListener("load", handleLoad)
                // eslint-disable-next-line prefer-rest-params
                return open.apply(this, arguments as unknown as [method: string, url: string | URL, async: boolean, username?: string | null | undefined, password?: string | null | undefined])
            }
        } catch (error) {
            console.log('Error in setupLoadListener: ', error)
        }
    }

    async function mutationCallback(mutationsList: any[], _observer: any) {
        const childListMutations = mutationsList.filter(
            (mutation: { type: string }) => mutation.type === "childList"
        )
        if (childListMutations.length) {
            await handleLoad()
        }
    }

    function setupObserver() {
        setTimeout(() => {
            const config = {
                attributes: true,
                childList: true,
                subtree: true,
                characterData: true,
            }
            observer = new MutationObserver(mutationCallback)
            observer.observe(document, config)
        }, 1000)
    }

    function setupScrollListener() {
        document.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const pageHalf = getVisiblePageHalf()
                    setTooltipPosition(pageHalf)
                    ticking = false
                })

                ticking = true
            }
        })
    }

    async function setupCart() {
        await handleLoad()
    }

    function getVisiblePageHalf() {
        const offset = widget.value?.getBoundingClientRect().top as number
        const halfPage = window.innerHeight / 2
        if (offset < halfPage) {
            return "top"
        } else {
            return "bottom"
        }
    }

    function setTooltipPosition(pageHalf: string) {
        if (pageHalf === "top") {
            tooltipText.value?.classList.remove("top")
            tooltipText.value?.classList.add("bottom")
        } else {
            tooltipText.value?.classList.remove("bottom")
            tooltipText.value?.classList.add("top")
        }
    }

    async function handleLoad() {
        try {
            cart.value = await fetchCart()
            product.value = await fetchProduct()
            widget.value?.setAttribute('display', cart.value.items.length ? 'visible' : 'none')
            await syncCart()
        } catch (error) {
            console.log('Error in handleLoad: ', error)
        }
    }

    async function syncCart(): Promise<void> {
        try {
            const itemTipOption = cart.value.items.find(
                (item: { handle: string }) => item.handle === "fulfillment-tip"
            )
            const tipOptionId = itemTipOption?.options_with_values[0].value
            if (tipOptionId && !tipOption.value) {
                if (tipOptionId === "1" && radio1.value) {
                    radio1.value.checked = true
                    tipOption.value = radio1.value
                } else if (tipOptionId === "2" && radio2.value) {
                    radio2.value.checked = true
                    tipOption.value = radio2.value
                }
            }
            if (!tipOptionId && tipOption.value) {
                if (radio1.value) radio1.value.checked = false
                if (radio2.value) radio2.value.checked = false
                tipOption.value = null
            }
            if (cart.value.items.length === 1 && tipOptionId) {
                cart.value = await removeTipFromCart(tipOptionId)
                refreshCart()
            }
        } catch (error) {
            console.log('Error in syncCart: ', error)
        }
    }

    function refreshCart() {
        const refreshSections = getSectionsToRender()
        refreshSections.forEach((section) => {
            for (const element of Array.from(document.querySelectorAll(section.id))) {
                console.log('Refreshing: ', section.id)
                const childElement = element.querySelector(section.selector)
                if (childElement) {
                    replaceSectionInnerHTML(childElement, section)
                } else {
                    replaceSectionInnerHTML(element, section)
                }
            }
        })
    }

    function replaceSectionInnerHTML(element: Element, section: CartSection) {
        const updatedHTML = getSectionInnerHTML(
            cart.value.sections[section.section],
            section.selector
        ) as string
        if (updatedHTML) element.innerHTML = updatedHTML
    }

    function getSectionInnerHTML(html: string, selector: string) {
        return new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector(selector)?.innerHTML
    }

    return {
        settings,
        setTipOption,
        tipOptionLoading,
        mountedIds
    }
}