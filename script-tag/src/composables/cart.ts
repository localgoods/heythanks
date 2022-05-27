import { Ref, onMounted, ref, onUnmounted } from 'vue'

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
    secondPrice: 500
}

export default function useTips() {

    let ticking = false
    let observer: MutationObserver | null = null
    const widget: Ref<HTMLDivElement | null> = ref(null)
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

            settings.value = {
                ...defaultSettings,
                firstPrice,
                secondPrice,
                ...customSettings
            }

            setupLoadListener()
            setupObserver()
            setupScrollListener()
            setupCart()
        } catch (error) {
            console.log('Error: ', error)
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

        tipOptionLoading.value = true
        // this.cartItemsElement.enableLoading()

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

        console.log(prevTipOptionId, currentTipOptionId)
        // if (prevTipOptionId && currentTipOptionId) {
        //     // this.cartItemsElement.enableLoading(this.cart.items.length)
        // }
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
        // this.cartItemsElement.disableLoading()
    }

    async function addTipToCart(tipOptionNumber: number): Promise<void> {
        await fetch("/cart/clear.js", { method: "POST" })
        const currentItems = (cart.value.items as { id: string, quantity: number }[]).map(({ id, quantity }) => {
            return { id, quantity }
        })
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
            },
            // {
            //     id: "main-cart-items",
            //     section: document.getElementById("main-cart-items")?.dataset.id as string,
            //     selector: ".js-contents",
            // },
            // {
            //     id: "cart-icon-bubble",
            //     section: "cart-icon-bubble",
            //     selector: ".shopify-section",
            // },
            // {
            //     id: "cart-live-region-text",
            //     section: "cart-live-region-text",
            //     selector: ".shopify-section",
            // },
            // {
            //     id: "main-cart-footer",
            //     section: document.getElementById("main-cart-footer")?.dataset.id as string,
            //     selector: ".js-contents",
            // },
        ]
    }

    function setupLoadListener(this: any) {
        const open = window.XMLHttpRequest.prototype.open
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        window.XMLHttpRequest.prototype.open = function () {
            this.addEventListener("load", self.handleLoad)
            // eslint-disable-next-line prefer-rest-params
            return open.apply(this, arguments as any)
        }
    }

    async function mutationCallback (mutationsList: any[], _observer: any) {
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
        // widget.value?.setAttribute('display', cart.value.items.length ? 'visible' : 'none') 
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
        const tooltipText = document.getElementById("tooltip-text") as HTMLElement
        if (pageHalf === "top") {
            tooltipText.classList.remove("top")
            tooltipText.classList.add("bottom")
        } else {
            tooltipText.classList.remove("bottom")
            tooltipText.classList.add("top")
        }
    }

    async function handleLoad () {
        cart.value = await fetchCart()
        product.value = await fetchProduct()
        await syncCart()
    }

    async function syncCart(this: any): Promise<void> {
        const itemTipOption = cart.value.items.find(
            (item: { handle: string }) => item.handle === "fulfillment-tip"
        )
        const tipOptionId = itemTipOption?.options_with_values[0].value
        if (tipOptionId && !tipOption.value) {
            const tipOptionElement = document.getElementById(`radio-${tipOptionId}`) as HTMLInputElement
            tipOptionElement.checked = true
            tipOption.value = tipOptionElement
        }
        if (!tipOptionId && tipOption.value) {
            const tipOptionElement = tipOption.value
            tipOptionElement.checked = false
            tipOption.value = null
        }
        if (cart.value.items.length === 1 && tipOptionId) {
            this.cart = await this.removeTipFromCart(tipOptionId)
            this.refreshCart()
        }
        (document.getElementById("tips-widget") as HTMLElement).style.display = cart.value.item_count
            ? "block"
            : "none"
    }

    function refreshCart() {
        // if (this.cartItemsElement) this.cartItemsElement.classList.toggle(
        //     "is-empty",
        //     this.cart.item_count === 0
        // )
        const cartFooter = document.getElementById("main-cart-footer")
        if (cartFooter)
            cartFooter.classList.toggle("is-empty", cart.value.item_count === 0)
        getSectionsToRender().forEach((section) => {
            const elementToReplace =
                document.getElementById(section.id)?.querySelector(section.selector) ||
                document.getElementById(section.id)
            if (elementToReplace) {
                const updatedHTML = getSectionInnerHTML(
                    cart.value.sections[section.section],
                    section.selector
                ) as string
                if (updatedHTML) elementToReplace.innerHTML = updatedHTML
            }
        })
        // this.updateLiveRegions()
        // document.activeElement.focus()
    }

    function getSectionInnerHTML(html: string, selector: string) {
        return new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector(selector)?.innerHTML
    }

    return {
        settings,
        setTipOption,
        tipOptionLoading
    }
}