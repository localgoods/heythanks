<script setup lang="ts">
import { onMounted } from 'vue';
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

const tips = {
  firstPrice: "$1.00",
  secondPrice: "$5.00"
}

const getProduct = async () => {
  const url = "/products/fulfillment-tip.js";
  const params = { method: "GET" };
  const response = await fetch(url, params);
  return await response.json();
};

onMounted(async () => {
  try {
    const product = await getProduct();
    console.log('Product: ', product);
  } catch(error) {
    console.log('Error: ', error);
  }
})
</script>

<template>
  <TipsWidget :settings="settings" :tips="tips" />
</template>

<style>
TipsWidget {
  display: block;
}
</style>
