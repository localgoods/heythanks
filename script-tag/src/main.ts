/* eslint-disable vue/one-component-per-file */
import { createApp, DefineComponent, h, reactive, ref } from 'vue'
import App from './App.vue'
import { defaultSettings } from './composables/cart'

declare global {
    interface Window {
        Shopify: unknown;
    }
}

const props = reactive({ settings: ref(defaultSettings) })

if (import.meta.env.PROD) {
    if (window.location.ancestorOrigins.length) {
        initPreview()
    } else {
        initWidgets()
    }
} else {
    createApp(() => h(App as unknown as DefineComponent, props)).mount('#heythanks')
}

function initPreview() {
    updateSettings()
    watchSettingsUpdates()
    const previewSelectEl = (document.querySelector("#heythanks-preview-box") as Element).firstChild?.firstChild
    const widgetId = "heythanks-preview"
    if (!document.getElementById(widgetId)) {
        insertWidgetInstance(widgetId, previewSelectEl as Element)
    }
}

function initWidgets() {
    if (window.location.pathname.includes("/cart")) {
        const subtotal = document.querySelector(".cart_subtotal")
        const widgetId = "heythanks-full"
        if (!document.getElementById(widgetId)) {
            insertWidgetInstance(widgetId, subtotal as Element)
        }
    } else {
        document.querySelectorAll(".cart_subtotal").forEach((subtotal, index) => {
            const widgetId = `heythanks-mini-${index}`
            if (!document.getElementById(widgetId)) {
                insertWidgetInstance(widgetId, subtotal)
            }
        })
    }
}

function insertWidgetInstance(widgetId: string, element: Element) {
    console.log('Inserting new root element', widgetId)
    const elementParent = element.parentNode
    const widget = document.createElement("div")
    widget.id = widgetId
    elementParent?.parentNode?.insertBefore(widget, elementParent)
    createApp(() => h(App as unknown as DefineComponent, props)).mount(`#${widgetId}`)
}

function watchSettingsUpdates () {
    window.removeEventListener('pricesupdate', updateSettings)
    window.removeEventListener('settingsupdate', updateSettings)
    window.addEventListener('pricesupdate', updateSettings)
    window.addEventListener('settingsupdate', updateSettings)
}

function updateSettings () {
    const newSettings = fetchSettings()
    const settingsChanged = JSON.stringify({ ...props.settings }) !== JSON.stringify(newSettings)
    if (newSettings && settingsChanged) {
        console.log("Updating settings")
        console.log(Object.keys({ ...props.settings }), Object.keys(newSettings))
        props.settings = { ...newSettings }
    }
}

function fetchSettings () {
    const previewEl = document.querySelector("#heythanks-preview-box") as HTMLDivElement
    const pricesEl = document.querySelector("#heythanks-prices") as HTMLDivElement
    const settings = JSON.parse(previewEl.dataset.settings as string)
    const { firstPrice, secondPrice } = JSON.parse(pricesEl.dataset.prices as string)
    
    if (!settings || !firstPrice || !secondPrice) return
    return { ...settings, firstPrice: parseInt(firstPrice) * 100, secondPrice: parseInt(secondPrice) * 100 }
}

