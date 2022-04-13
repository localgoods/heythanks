<script setup lang="ts">
import TipsWidget from './components/TipsWidget.vue'

const settings = {
  // Emoji Options
  firstEmoji: "🙂",
  secondEmoji: "🥰",

  // Style Options
  backgroundColor: "#ffffff",
  selectionColor: "#3678b4",
  strokeColor: "#d9d9d9",
  strokeWidth: 2,
  cornerRadius: 2,

  // Text Options
  labelText: "Send a tip directly to your fulfillment workers 💜",
  tooltipText: "HeyThanks is a service that delivers your tips directly to the fulfillment employees who pick, pack, and ship your order."
}

const allProducts = {
  "fulfillment-tip": {
    variants: [
      {
        price: '$1.00'
      },
      {
        price: '$5.00'
      }
    ]
  }
}
</script>

<template>
  <TipsWidget :settings="settings" :allProducts="allProducts" />
</template>

<style>
TipsWidget {
  display: block;
}
</style>
