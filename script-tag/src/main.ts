import { Component, createApp } from 'vue'
import App from './App.vue'

const instances: Record<string, Component> = {
    'heythanks-full': {},
    'heythanks-mini-0': {},
    'heythanks-mini-1': {},
    'heythanks-mini-2': {}
}

if (import.meta.env.PROD) {

    initWidgets()
    
} else {
    createApp(App).mount('#heythanks')
}

function initWidgets() {
    const cartSubtotals = document.querySelectorAll(".cart_subtotal")
    if (window.Shopify.CartType) {
        const widgetId = "heythanks-full"
        const subtotal = cartSubtotals[0]
        if (!document.getElementById(widgetId)) {
            mountWidget(widgetId, subtotal)
        }
    } else {
        cartSubtotals.forEach((subtotal, index) => {
            const widgetId = `heythanks-mini-${index}`
            if (!document.getElementById(widgetId)) {
                mountWidget(widgetId, subtotal)
            }
        })
    }
}

function mountWidget(widgetId: string, subtotal: Element) {
    console.log('insertWidgetElement')
    const subtotalParent = subtotal.parentNode
    const widget = document.createElement("div")
    widget.id = widgetId
    subtotalParent?.parentNode?.insertBefore(widget, subtotalParent)
    instances[widgetId] = createApp(App).mount(`#${widgetId}`)
}

