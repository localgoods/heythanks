/* eslint-disable vue/one-component-per-file */
import { createApp, h } from 'vue'
import App from './App.vue'

declare global {
    interface Window {
        Shopify: any;
    }
}

if (import.meta.env.PROD) {
    initWidgets()
} else {
    createApp({ render: () => h({ ...App }) }).mount('#heythanks')
}

function initWidgets() {
    const cartSubtotals = document.querySelectorAll(".cart_subtotal")
    if (window.location.pathname.includes("/cart")) {
        const widgetId = "heythanks-full"
        const subtotal = cartSubtotals[0]
        if (!document.getElementById(widgetId)) {
            insertWidgetInstance(widgetId, subtotal)
        }
    } else {
        cartSubtotals.forEach((subtotal, index) => {
            const widgetId = `heythanks-mini-${index}`
            if (!document.getElementById(widgetId)) {
                insertWidgetInstance(widgetId, subtotal)
            }
        })
    }
}

function insertWidgetInstance(widgetId: string, subtotal: Element) {
    console.log('Inserting new root element')
    const subtotalParent = subtotal.parentNode
    const widget = document.createElement("div")
    widget.id = widgetId
    subtotalParent?.parentNode?.insertBefore(widget, subtotalParent)
    const app = createApp({ render: () => h({ ...App }) }, { widgetId })
    app.mount(`#${widgetId}`)
}

