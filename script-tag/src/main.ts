/* eslint-disable vue/one-component-per-file */
import { createApp, DefineComponent, h, reactive, ref } from 'vue'
import App from './App.vue'
import { defaultSettings } from './composables/cart'
import './index.css'
import { AppElementMap } from './interfaces/AppElementMap'

const appElements: AppElementMap = {
    "heythanks-preview": null,
    "heythanks-full": null,
    "heythanks-mini-0": null,
    "heythanks-mini-1": null,
    "heythanks-mini-2": null,
    "heythanks-mini-3": null
}

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
    const app = createApp(() => h(App as unknown as DefineComponent, props))
    app.mount('#heythanks')
}

function initPreview() {
    applySettings()
    applyCss()
    watchDataUpdates()
    const dataDiv = getDataDiv()
    const widgetId = "heythanks-preview"
    if (!document.getElementById(widgetId)) {
        appElements[widgetId] = insertWidgetInstance(widgetId, dataDiv as Element)
    }
}

function initWidgets() {
    if (window.location.pathname.includes("/cart")) {
        const cartSubtotalDiv = getCartSubtotalDiv()
        const widgetId = "heythanks-full"
        if (!document.getElementById(widgetId)) {
            appElements[widgetId] = insertWidgetInstance(widgetId, cartSubtotalDiv?.parentElement as Element)
            console.log("Inserted full widget", appElements[widgetId])
        }
    } else {
        getCartSubtotalDivAll().forEach((subtotal, index) => {
            const widgetId = `heythanks-mini-${index}`
            if (!document.getElementById(widgetId)) {
                appElements[widgetId as keyof AppElementMap] = insertWidgetInstance(widgetId, subtotal.parentElement as Element)
                console.log("Inserted mini widget", appElements[widgetId as keyof AppElementMap])
            }
        })
    }
}

function insertWidgetInstance(widgetId: string, element: Element) {
    const widgetDiv = document.createElement("div")
    widgetDiv.id = widgetId
    element.parentNode?.insertBefore(widgetDiv, element)
    const app = createApp(() => h(App as unknown as DefineComponent, props))
    app.mount(`#${widgetId}`)
    return widgetDiv
}

function watchDataUpdates() {
    window.removeEventListener('previewvisible', rehydratePreview)
    window.removeEventListener('cssupdate', applyCss)
    window.removeEventListener('pricesupdate', applySettings)
    window.removeEventListener('settingsupdate', applySettings)
    window.addEventListener('previewvisible', rehydratePreview)
    window.addEventListener('cssupdate', applyCss)
    window.addEventListener('pricesupdate', applySettings)
    window.addEventListener('settingsupdate', applySettings)
}

function rehydratePreview() {
    console.log("Rehydrating preview")
    const dataDiv = getDataDiv()
    const widgetId = "heythanks-preview"
    const widgetDiv = appElements[widgetId]
    if (dataDiv && widgetDiv && !document.getElementById(widgetId)) {
        dataDiv.parentNode?.insertBefore(widgetDiv, dataDiv)
    }
}

function applyCss() {
    const newCss = fetchCss()
    const cssChanged = props.css !== newCss
    if (newCss && cssChanged) {
        props.css = newCss
        const styleTag = insertStyleTag(props.css)
        console.log('Style tag', styleTag)
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
    const settings = JSON.parse(dataDiv.dataset.settings as string)
    const pricesDiv = getPricesDiv() || getDataDiv()
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

function insertStyleTag(css: string) {
    const styleTag = document.createElement("style")
    styleTag.innerHTML = css
    return document.head.appendChild(styleTag)
}
