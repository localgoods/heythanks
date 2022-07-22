/* eslint-disable vue/one-component-per-file */
import { createApp, DefineComponent, h, reactive, ref } from 'vue'
import App from '@/App.vue'
import { defaultSettings } from '@/composables/cart'
import { appDictionary, getShop } from '@/config'
import '@/index.css'

const currentShop = getShop()
const settings = ref(defaultSettings)
const sections = currentShop?.cartSections
const workerImg = currentShop?.workerImg
const props = reactive({ settings, sections, workerImg })

if (import.meta.env.PROD) {
    // Check for the preview iFrame
    if (isFrame() && !currentShop) {
        initPreview()
    } else {
        initLive()
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
    const widgetId = 'heythanks-preview'
    if (!document.getElementById(widgetId)) {
        appDictionary[widgetId] = insertWidgetInstance(widgetId, dataDiv as Element)
    }
}

function initLive() {
    if (getDataDiv()) applySettings()
    if (isFullCart()) {
        console.log("Full cart detected")
        const cartSubtotalDiv = getWidgetPlacementDiv()
        const widgetId = 'heythanks-full'
        if (!document.getElementById(widgetId)) {
            appDictionary[widgetId] = insertWidgetInstance(widgetId, cartSubtotalDiv?.parentElement as Element)
            console.log("Inserted full widget", appDictionary[widgetId])
        }
    } else {
        console.log("Mini cart detected")
        getWidgetPlacementDivAll().forEach((subtotal, index) => {
            const widgetId = `heythanks-mini-${index}` as keyof typeof appDictionary
            if (!document.getElementById(widgetId)) {
                appDictionary[widgetId] = insertWidgetInstance(widgetId, subtotal.parentElement as Element)
                console.log("Inserted mini widget", appDictionary[widgetId])
            }
        })
    }
}

function insertWidgetInstance(widgetId: string, element: Element) {
    const widgetDiv = document.createElement("div")
    widgetDiv.id = widgetId

    console.log("Wrapper class", currentShop?.wrapperClass)

    widgetDiv.classList.add(currentShop?.wrapperClass as string)
    element.parentNode?.insertBefore(widgetDiv, element)
    const app = createApp(() => h(App as unknown as DefineComponent, props))
    app.mount(`#${widgetId}`)
    return widgetDiv
}

function insertStyleTag(css: string) {
    const styleTag = document.createElement("style")
    styleTag.innerHTML = css
    return document.head.appendChild(styleTag)
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
    const widgetId = 'heythanks-preview'
    const widgetDiv = appDictionary[widgetId]
    if (dataDiv && widgetDiv && !document.getElementById(widgetId)) {
        dataDiv.parentNode?.insertBefore(widgetDiv, dataDiv)
    }
}

function applyCss() {
    const newCss = fetchCss()
    const styleTag = insertStyleTag(newCss)
    console.log('Style tag', styleTag)
}

function applySettings() {
    const newSettings = fetchSettings()
    const settingsChanged = JSON.stringify({ ...props.settings }) !== JSON.stringify(newSettings)
    if (newSettings && settingsChanged) {
        console.log("Updating settings", newSettings)
        props.settings = { ...newSettings }
    }
}

function fetchCss() {
    const dataDiv = getDataDiv()
    return dataDiv?.dataset.css as string
}

function fetchSettings() {
    const dataDiv = getDataDiv()
    const settings = JSON.parse(dataDiv?.dataset.settings as string)
    const pricesDiv = getPricesDiv() || getDataDiv()
    if (pricesDiv.dataset.prices) {
        const { firstPrice, secondPrice } = JSON.parse(pricesDiv.dataset.prices)
        if (!settings || !firstPrice || !secondPrice) return
        return { ...settings, firstPrice: parseInt(firstPrice) * 100, secondPrice: parseInt(secondPrice) * 100 }
    }
    return settings
}

function getDataDiv() {
    return document.querySelector("#heythanks-data") as HTMLDivElement
}

function getPricesDiv() {
    return document.querySelector("#heythanks-prices") as HTMLDivElement
}

function getWidgetPlacementDiv() {
    const placementSelector = currentShop?.placementSelector as string
    return document.querySelector(placementSelector) as HTMLDivElement
}

function getWidgetPlacementDivAll() {
    const placementSelector = currentShop?.placementSelector as string
    return document.querySelectorAll(placementSelector) as NodeListOf<HTMLDivElement>
}

function isFrame() {
    return window.location.ancestorOrigins.length
}

function isFullCart() {
    return window.location.pathname.includes("/cart")
}
