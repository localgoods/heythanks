/* eslint-disable vue/one-component-per-file */
import { createApp, DefineComponent, h, reactive, ref } from 'vue'
import App from './App.vue'
import { defaultSettings } from './composables/cart'
import './index.css'

const app = createApp(() => h(App as unknown as DefineComponent, props))

declare global {
    interface Window {
        Shopify: unknown;
    }
}

const css = ref('')
const settings = ref(defaultSettings)
const props = reactive({ css, settings })

if (import.meta.env.PROD) {
    if (window.location.ancestorOrigins.length) {
        initPreview()
    } else {
        initWidgets()
    }
} else {
    mountWidget('heythanks')
}

function initPreview() {
    applySettings()
    applyCss()
    watchDataUpdates()
    const dataDiv = getDataDiv()
    const widgetId = "heythanks-preview"
    if (!document.getElementById(widgetId)) {
        insertWidgetInstance(widgetId, dataDiv as Element)
        mountPreview(widgetId)
    }
}

function initWidgets() {
    if (window.location.pathname.includes("/cart")) {
        const cartSubtotalDiv = getCartSubtotalDiv()
        const widgetId = "heythanks-full"
        if (!document.getElementById(widgetId)) {
            insertWidgetInstance(widgetId, cartSubtotalDiv?.parentElement as Element)
            mountWidget(widgetId)
        }
    } else {
        getCartSubtotalDivAll().forEach((subtotal, index) => {
            const widgetId = `heythanks-mini-${index}`
            if (!document.getElementById(widgetId)) {
                insertWidgetInstance(widgetId, subtotal.parentElement as Element)
                mountWidget(widgetId)
            }
        })
    }
}

function insertWidgetInstance(widgetId: string, element: Element) {
    const widget = document.createElement("div")
    widget.id = widgetId
    element.parentNode?.insertBefore(widget, element)
}

function watchDataUpdates() {
    window.removeEventListener('previewvisible', initPreview)
    window.removeEventListener('cssupdate', applyCss)
    window.removeEventListener('pricesupdate', applySettings)
    window.removeEventListener('settingsupdate', applySettings)
    window.addEventListener('previewvisible', initPreview)
    window.addEventListener('cssupdate', applyCss)
    window.addEventListener('pricesupdate', applySettings)
    window.addEventListener('settingsupdate', applySettings)
}

function mountPreview(widgetId: string) {
    if (app._container) app.unmount()
    setTimeout(() => {
        console.log('Mounting preview widget')
        mountWidget(widgetId)
    }, 1000)
}

function mountWidget(widgetId: string) {
    app.mount(`#${widgetId}`)
}

function applyCss() {
    const newCss = fetchCss()
    const cssChanged = props.css !== newCss
    if (newCss && cssChanged) {
        console.log("Updating css")
        props.css = newCss
    }
}

function applySettings() {
    const newSettings = fetchSettings()
    const settingsChanged = JSON.stringify({ ...props.settings }) !== JSON.stringify(newSettings)
    if (newSettings && settingsChanged) {
        console.log("Updating settings")
        props.settings = { ...newSettings }
    }
}

function fetchCss() {
    const dataDiv = getDataDiv()
    return dataDiv.dataset.css as string
}

function fetchSettings() {
    const dataDiv = getDataDiv()
    const pricesDiv = getPricesDiv()
    const settings = JSON.parse(dataDiv.dataset.settings as string)
    const { firstPrice, secondPrice } = JSON.parse(pricesDiv.dataset.prices as string)
    if (!settings || !firstPrice || !secondPrice) return
    return { ...settings, firstPrice: parseInt(firstPrice) * 100, secondPrice: parseInt(secondPrice) * 100 }
}

function getDataDiv() {
    return document.querySelector("#heythanks-data") as HTMLDivElement
}

function getPricesDiv() {
    return document.querySelector("#heythanks-prices") as HTMLDivElement
}

function getCartSubtotalDiv() {
    return document.querySelector(".cart_subtotal") as HTMLDivElement
}

function getCartSubtotalDivAll() {
    return document.querySelectorAll(".cart_subtotal") as NodeListOf<HTMLDivElement>
}
