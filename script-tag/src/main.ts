/* eslint-disable vue/one-component-per-file */
import { createApp, h } from 'vue'
import App from './App.vue'

declare global {
    interface Window {
        Shopify: any;
    }
}

console.log('Loading HeyThanks...', import.meta.env)

if (import.meta.env.PROD) {
    if (window.location.pathname.includes("/admin/apps")) {
        initPreview()
    } else {
        initWidgets()
    }
} else {
    createApp({ render: () => h({ ...App }) }).mount('#heythanks')
}

function initPreview() {
    const previewBox = document.querySelector("#heythanks-preview-box")
    const widgetId = "heythanks-preview"
    if (!document.getElementById(widgetId)) {
        insertWidgetInstance(widgetId, previewBox as Element)
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

function insertWidgetInstance(widgetId: string, subtotal: Element) {
    console.log('Inserting new root element')
    const subtotalParent = subtotal.parentNode
    const widget = document.createElement("div")
    widget.id = widgetId
    subtotalParent?.parentNode?.insertBefore(widget, subtotalParent)
    const app = createApp({ render: () => h({ ...App }) }, { widgetId })
    app.mount(`#${widgetId}`)
}

