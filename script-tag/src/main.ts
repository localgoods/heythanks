import { createApp } from 'vue'
import App from './App.vue'

if (import.meta.env.PROD) {
    const cartSubtotal = document.getElementsByClassName("cart_subtotal")[0]
    const cartSubtotalParent = cartSubtotal.parentNode
    const widget = document.createElement("div")
    widget.id = "widget"
    cartSubtotalParent?.parentNode?.insertBefore(widget, cartSubtotalParent)
}
createApp(App).mount('#widget')

