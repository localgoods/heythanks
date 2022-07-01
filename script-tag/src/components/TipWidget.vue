<template>
  <div
    v-show="settings.displayStatus || isPreview"
    id="heythanks-widget"
    class="widget__wrapper"
    :class="{ mini: !fullCart, 'settings-loading': settingsLoading }"
  >
    <TipContent
      :label-text="settings.labelText"
      :tooltip-text="settings.tooltipText"
    />

    <input
      id="radio-1"
      type="radio"
      name="tip-option"
      class="widget__input invisible"
      :disabled="tipsLoading"
      @click="handleTipChange($event)"
      @keyup="handleTipChange($event)"
    >
    <label
      for="radio-1"
      :class="{ 'tips-loading': tipsLoading }"
      class="widget__label animated unselectable"
    >
      <div class="widget__label-inner">
        <svg
          class="widget__radio-check animated"
          viewBox="0 0 6 4"
          fill="none"
        >
          <path
            d="M1.20005 1.99992L2.86819 3.48173"
            stroke="white"
          />
          <line
            x1="2.19643"
            y1="3.44637"
            x2="4.89644"
            y2="0.746374"
            stroke="white"
          />
        </svg>
        <span class="widget__radio-control animated" />
        <span
          v-if="settings.firstEmoji !== 'None'"
          class="widget__radio-emoji"
        >{{ settings.firstEmoji }}</span>
        <span
          v-if="settings.firstPrice"
          class="widget__radio-price"
        >{{
          price(settings.firstPrice)
        }}</span>
      </div>
    </label>

    <input
      id="radio-2"
      type="radio"
      name="tip-option"
      class="widget__input invisible"
      :disabled="tipsLoading"
      @click="handleTipChange($event)"
      @keyup="handleTipChange($event)"
    >
    <label
      for="radio-2"
      :class="{ 'tips-loading': tipsLoading }"
      class="widget__label animated unselectable"
    >
      <div class="widget__label-inner">
        <svg
          class="widget__radio-check animated"
          viewBox="0 0 6 4"
          fill="none"
        >
          <path
            d="M1.20005 1.99992L2.86819 3.48173"
            stroke="white"
          />
          <line
            x1="2.19643"
            y1="3.44637"
            x2="4.89644"
            y2="0.746374"
            stroke="white"
          />
        </svg>
        <span class="widget__radio-control animated" />
        <span
          v-if="settings.secondEmoji !== 'None'"
          class="widget__radio-emoji"
        >{{ settings.secondEmoji }}</span>
        <span
          v-if="settings.secondPrice"
          class="widget__radio-price"
        >{{
          price(settings.secondPrice)
        }}</span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  Ref,
  defineProps,
  toRef,
  computed,
} from "vue"
import useCart from "~/composables/cart"
import { sectionsToClear, sectionsToRefresh } from "~/composables/page"
import { Section } from "~/interfaces/Section"
import { Settings } from "~/interfaces/Settings"
import TipContent from "~/components/TipContent.vue"

const props = defineProps<{
  settings: Settings;
}>()
const outerSettings = toRef(props, "settings") as Ref<Settings>

const {
  cart,
  fetchCart,
  product,
  fetchProduct,
  tip,
  setTip,
  settings,
  settingsLoading,
} = useCart(outerSettings)
let observer: MutationObserver | null = null
const tipsLoading: Ref<boolean> = ref(false)
const fullCart = window.location.pathname.includes("/cart")

onMounted(async () => {
  // Dummy load for local app changes
  if (
    document.querySelector("#heythanks") ||
    document.querySelector("#heythanks-preview")
  ) {
    settingsLoading.value = true
    setTimeout(() => {
      settingsLoading.value = false
      setTip({ id: "radio-1" })
    }, 4000)
  }

  setupLoadListener()
  setupObserver()
  await handleLoad()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

/**
 * Sets tip option from radio selection on click or keyup event
 *
 * @param event {Event} Click or keyup event
 * @returns {void}
 */
async function handleTipChange(
  event: KeyboardEvent | MouseEvent
): Promise<void> {
  tipsLoading.value = true

  const prevOption = tip.value

  if (prevOption.id === (event.target as HTMLInputElement).id) {
    setTip({ id: null })
  } else {
    setTip({ id: (event.target as HTMLInputElement).id })
  }

  const currentOption = tip.value

  if (prevOption.id && window.Shopify) {
    const prevOptionNumber = parseInt(prevOption.id.split("-")[1])
    cart.value = await removeTipFromCart(prevOptionNumber)
  }
  if (currentOption.id && window.Shopify) {
    const currentOptionNumber = parseInt(currentOption.id.split("-")[1])
    cart.value = await addTipToCart(currentOptionNumber)
  }
  if ((prevOption.id || currentOption.id) && window.Shopify) {
    refreshCart()
  }
  tipsLoading.value = false
}

async function addTipToCart(tipOptionNumber: number): Promise<void> {
  console.log("addTipToCart")
  await fetch("/cart/clear.js", { method: "POST" })
  const currentItems = cart.value?.items as { id: string; quantity: number }[]
  const tipId = product.value.variants[tipOptionNumber - 1].id
  const formData = {
    items: [
      {
        id: tipId,
        quantity: 1,
      },
      ...currentItems,
    ],
    sections: sectionsToRefresh.map(
      (section: { section: any }) => section.section
    ),
    sections_url: window.location.pathname,
  }
  const url = "/cart/add.js"
  const params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(formData),
  }
  const response = await fetch(url, params)
  return await response.json()
}

async function removeTipFromCart(tipOptionNumber: number) {
  console.log("removeTipFromCart")
  const tipId = product.value.variants[tipOptionNumber - 1].id
  const formData = {
    updates: { [tipId]: 0 },
    sections: sectionsToRefresh.map(
      (section: { section: any }) => section.section
    ),
    sections_url: window.location.pathname,
  }
  const url = "/cart/update.js"
  const params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(formData),
  }
  const response = await fetch(url, params)
  return await response.json()
}

function setupLoadListener(this: any) {
  const open = window.XMLHttpRequest.prototype.open
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  window.XMLHttpRequest.prototype.open = function () {
    this.addEventListener("load", handleLoad)
    // eslint-disable-next-line prefer-rest-params
    return open.apply(this, arguments as any)
  }
}

async function mutationCallback(mutationsList: any[], _observer: any) {
  const childListMutations = mutationsList.filter(
    (mutation: { type: string }) => mutation.type === "childList"
  )
  if (childListMutations.length) {
    await handleLoad()
  }
}

function setupObserver() {
  setTimeout(() => {
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    }
    observer = new MutationObserver(mutationCallback)
    observer.observe(document, config)
  }, 1000)
}

async function handleLoad() {
  console.log("Handle load")
  if (window.Shopify) {
    cart.value = await fetchCart()
    product.value = await fetchProduct()
    const cartItems = cart.value?.items
    const tipProduct = cartItems.find(
      (item: { handle: string }) => item.handle === "fulfillment-tip"
    )
    const cartOptionId = tipProduct?.options_with_values[0].value
    if (cartOptionId && !tip.value.id) {
      setTip({ id: `radio-${cartOptionId}` })
    }
    if (!cartOptionId && tip.value.id) {
      setTip({ id: null })
    }
    if (cartItems.length === 1 && cartOptionId) {
      cart.value = await removeTipFromCart(cartOptionId)
      clearCart()
    }
  }
}

function clearCart() {
  sectionsToClear.forEach((section) => {
    console.log("Clearing", section.id)
    replaceSection(section)
  })
}

function refreshCart() {
  sectionsToRefresh.forEach((section) => {
    console.log("Refreshing", section.id)
    replaceSection(section)
  })
}

function replaceSection(section: Section) {
  document.querySelectorAll(`#${section.id}`).forEach((element) => {
    const childElements = element.querySelectorAll(section.selector)
    if (childElements.length) {
      childElements.forEach((childElement) => {
        replaceSectionInnerHTML(childElement, section)
      })
    } else {
      replaceSectionInnerHTML(element, section)
    }
  })
}

function replaceSectionInnerHTML(element: Element, section: Section) {
  const updatedHTML = getSectionInnerHTML(
    cart.value.sections[section.section],
    section.selector
  ) as string
  if (updatedHTML) element.innerHTML = updatedHTML
}

function getSectionInnerHTML(html: string, selector: string) {
  return new DOMParser()
    .parseFromString(html, "text/html")
    .querySelector(selector)?.innerHTML
}

/**
 * Returns the price in dollar display format
 *
 * @param price {number} Price of the tip in cents (e.g. 100)
 * @returns {string} Price in dollar display format (e.g. "$1.00")
 */
function price(price: number): string {
  const dollars = Math.floor(price / 100)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars)
}

const isPreview = computed(() => {
  return !window.Shopify
})
</script>

<style>
.widget__label {
  border-radius: v-bind("settings.cornerRadius + 'px'");
  border-width: v-bind("settings.strokeWidth + 'px'");
  border-color: v-bind("settings.strokeColor");
  background: v-bind("settings.backgroundColor");
}

.widget__radio-control {
  border-width: v-bind("settings.strokeWidth + 'px'");
  border-color: v-bind("settings.strokeColor");
}

.widget__input:checked + .widget__label {
  border-color: v-bind("settings.selectionColor");
}

.widget__input:checked
  + .widget__label
  > .widget__label-inner
  > .widget__radio-control {
  border-color: v-bind("settings.selectionColor");
  background: v-bind("settings.selectionColor");
}

.no-wrap {
  white-space: nowrap;
}

.unselectable {
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.animated {
  -webkit-tap-highlight-color: transparent;
  -webkit-transition: background 0.25s ease;
  transition: background 0.25s ease;
  -webkit-transition: border-color 0.25s ease;
  transition: border-color 0.25s ease;
  -webkit-transition: opacity 2s;
  transition: opacity 2s;
}

.invisible {
  opacity: 0;
  width: 0;
  height: 0;
}

.widget__wrapper {
  position: relative;
  border-bottom: 0.1rem solid rgba(var(--color-foreground), 0.08);
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 10px;
  margin-bottom: 30px;
}

.widget__article {
  display: flex;
  flex-direction: column;
  grid-column: 4 / 23;
  grid-row: 1;
  text-align: right;
  margin: 0 2rem 0 auto;
  max-width: 250px;
}

.widget__header {
  font-size: 14px;
}

.widget__subheader {
  color: #5f36d2;
  margin-top: auto;
  padding-top: 0.75rem;
  font-size: 12px;
}

.widget__label {
  padding: 2px;
  text-align: center;
  height: 60px;
  width: 60px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-style: solid;
  /* ians additions */
  animation-delay: 0s;
  animation: fade-in 2s;
}

.widget__label > .widget__label-inner > span {
  display: block;
}

.widget__label[for="radio-1"] {
  grid-column: 23;
  grid-row: 1;
}

.widget__label[for="radio-2"] {
  grid-column: 24;
  grid-row: 1;
}

.widget__radio-control {
  position: relative;
  height: 10px;
  width: 10px;
  margin-left: auto;
  margin-bottom: -10px;
  display: block;
  border-radius: 50%;
  border-style: solid;
  cursor: pointer;
}

.widget__input + .widget__label > .widget__label-inner > .widget__radio-check {
  display: none;
}

.widget__input:checked
  + .widget__label
  > .widget__label-inner
  > .widget__radio-check {
  position: relative;
  height: 10px;
  width: 10px;
  margin-left: auto;
  z-index: 100;
  margin-bottom: -10px;
  display: block;
  border-radius: 50%;
  cursor: pointer;
}

.widget__input:checked
  + .widget__label
  > .widget__label-inner
  > .widget__radio-price {
  font-weight: bold;
}

.widget__radio-emoji {
  align-self: center;
  font-size: 25px;
  transform: scale(0.75);
  line-height: calc(1.5 * 0.75);
  margin: auto;
  margin-top: 50%;
  margin-bottom: -75%;
  transform: translateY(-75%);
}

.widget__radio-price {
  align-self: center;
  font-size: 12px;
  margin: auto;
  margin-top: 50%;
  transform: translateY(-50%);
}

.widget__logo {
  height: calc(1.8 * 12px);
  vertical-align: bottom;
}

.widget__tooltip {
  position: relative;
  height: 12px;
  display: inline-block;
}

.widget__tooltip .widget__tooltip-text {
  visibility: hidden;
  width: 180px;
  background-color: black;
  color: #fff;
  text-align: left;
  border-radius: 6px;
  padding: 10px;
  white-space: normal;
  position: absolute;
  z-index: 1;
  left: 50%;
  margin-left: -90px;
}

.widget__tooltip .widget__tooltip-text.top {
  bottom: 150%;
}

.widget__tooltip .widget__tooltip-text:after {
  content: "";
  position: absolute;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
}

.widget__tooltip .widget__tooltip-text.top:after {
  top: 100%;
  border-color: black transparent transparent transparent;
}

.widget__tooltip:hover .widget__tooltip-text {
  visibility: visible;
}

@keyframes fade-in {
  from {
    opacity: 20%;
  }

  to {
    opacity: 100%;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 20%;
  }
}

.widget__article {
  grid-column: 4 / 23;
  grid-row: 1 / 3;
  text-align: left;
  margin: auto;
}

.widget__label[for="radio-1"] {
  grid-column: 24;
  grid-row: 1;
}

.widget__label[for="radio-2"] {
  grid-column: 24;
  grid-row: 2;
}

.mini .widget__wrapper {
  gap: 10px 0;
  margin-bottom: 0;
}

.mini .widget__article {
  grid-column: 4 / 23;
  grid-row: 1 / 3;
  text-align: left;
  margin: auto;
}

.mini .widget__label {
  margin-right: 30px;
}

.mini .widget__label[for="radio-1"] {
  grid-column: 24;
  grid-row: 1;
}

.mini .widget__label[for="radio-2"] {
  grid-column: 24;
  grid-row: 2;
}

.settings-loading .widget__header {
  visibility: hidden;
  background-color: lightgrey;
}

.settings-loading .widget__label {
  animation-delay: 0s;
  animation: fade-out 6s, loadgradient 7s infinite;
  border: 0px !important;
}

.settings-loading .widget__radio-check,
.settings-loading .widget__radio-control,
.settings-loading .widget__radio-emoji,
.settings-loading .widget__radio-price {
  display: none !important;
}

@keyframes loadgradient {
  from {
    background-color: rgb(215, 215, 215);
  }

  to {
    background-color: rgb(185, 185, 185);
  }
}

.tips-loading {
  opacity: 0.75;
}
</style>
