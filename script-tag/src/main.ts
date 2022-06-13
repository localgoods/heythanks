import { createApp } from 'vue'
import App from './App.vue'

if (import.meta.env.PROD) {

    const cartPopupLink = document.getElementsByClassName("icon-cart mini_cart dropdown_link")[0]

    if (cartPopupLink) {
        console.log("Found cart popup link")
        cartPopupLink.addEventListener("mouseover", insertWidgetElement)
        cartPopupLink.addEventListener("click", insertWidgetElement)
    } else {
        console.log("Did not find cart popup link")
    }

    insertWidgetElement()
    
} else {
    createApp(App).mount('#heythanks')
}

function insertWidgetElement() {
    console.log('insertWidgetElement')
    const cartSubtotal = document.getElementsByClassName("cart_subtotal")[0]
    if (cartSubtotal) {
        const cartSubtotalParent = cartSubtotal.parentNode
        const widget = document.createElement("div")
        widget.id = "heythanks"
        cartSubtotalParent?.parentNode?.insertBefore(widget, cartSubtotalParent)
        createApp(App).mount('#heythanks')
    }
}

