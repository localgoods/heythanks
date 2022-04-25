import { createApp } from 'vue'
import App from './App.vue'

if (import.meta.env.PROD) {
    const cartSubtotal = document.getElementsByClassName("cart_subtotal")[0];
    const cartSubtotalParent = cartSubtotal.parentNode;
    const tipsWidget = document.createElement("div");
    tipsWidget.id = "tips-widget";
    cartSubtotalParent?.parentNode?.insertBefore(tipsWidget, cartSubtotalParent);
} 
createApp(App).mount('#tips-widget')

