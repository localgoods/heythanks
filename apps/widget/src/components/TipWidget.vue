<template>
  <div
    v-show="settings.displayStatus || isPreview"
    id="heythanks-widget"
    class="widget__wrapper"
  >
    <div class="widget__row">
      <div class="widget__avatar">
        <object
          data="https://storage.googleapis.com/heythanks-app-images/Worker.svg"
          type="image/svg+xml"
          class="widget__avatar-inner"
        />
      </div>
      <div class="widget__content">
        <div class="widget__header">
          <span>{{ settings.labelText }}</span>
        </div>
        <div class="widget__subheader no-wrap">
          Powered by
          <a
            href="https://heythanks.io" 
            target="_blank"
          >
            <object
              data="https://storage.googleapis.com/heythanks-app-images/HeyThanksLogo.svg"
              type="image/svg+xml"
              class="widget__logo"
            />
          </a>
        </div>
      </div>
      <div class="widget__buttons">
        <div class="widget__button">
          <input
            id="tip-0"
            type="radio"
            name="tip-option"
            class="widget__input invisible"
            @click="handleTipChange"
            @keyup="handleTipChange"
          >
          <label
            for="tip-0"
            class="widget__label animated unselectable"
          >
            <div class="widget__label-inner">
              <span>{{ price(settings.firstPrice) }}</span>
            </div>
          </label>
        </div>

        <div class="widget__button">
          <input
            id="tip-1"
            type="radio"
            name="tip-option"
            class="widget__input invisible"
            @click="handleTipChange"
            @keyup="handleTipChange"
          >
          <label
            for="tip-1"
            class="widget__label animated unselectable"
          >
            <div class="widget__label-inner">
              <span>{{ price(settings.secondPrice) }}</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
  defineProps,
  computed,
  toRefs,
  unref,
watch
} from "vue"
import useCart from "@/composables/cart"
import { Section } from "@/interfaces/Section"
import { Settings } from "@/interfaces/Settings"

const props = defineProps<{
  settings: Settings;
  sections?: Section[];
}>()
const { settings: previewSettings } = toRefs(props)
const cartSections = unref(props.sections)

const {
  cart,
  fetchCart,
  product,
  fetchProduct,
  tip,
  setTip,
  settings,
  settingsLoading
} = useCart({ previewSettings, cartSections })

const tipLoading = ref(false)
let observer: MutationObserver | null = null
const fullCart = window.location.pathname.includes("/cart")

const isPreview = computed(() => {
  return !cartSections?.length
})

onMounted(async () => {
  if (
    isPreview.value
  ) {
    settingsLoading.value = true
    setTimeout(() => {
      settingsLoading.value = false
      setTip({ id: `tip-0` })
    }, 2000)
  }

  if (!fullCart && !isPreview.value) document.querySelectorAll('#heythanks-widget').forEach((element: Element) => element.classList.add('mini'))

  setupLoadListener()
  await handleLoad()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

watch(tipLoading, (newValue) => {
  const classOperation = newValue ? 'add' : 'remove'
  document.querySelectorAll('#heythanks-widget').forEach((element: Element) => element.classList[classOperation]('tip-loading'))
  console.log('Setting disabled to', !!newValue)
  document.querySelectorAll("[id*='tip-']").forEach((element: Element) => (element as HTMLButtonElement).disabled = !!newValue)
})

watch(settingsLoading, (newValue) => {
  const classOperation = newValue ? 'add' : 'remove'
  document.querySelectorAll('#heythanks-widget').forEach((element: Element) => element.classList[classOperation]('settings-loading'))
  console.log('Setting disabled to', !!newValue)
  document.querySelectorAll("[id*='tip-']").forEach((element: Element) => (element as HTMLButtonElement).disabled = !!newValue)
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
  if (!tipLoading.value) {
    tipLoading.value = true

    const prevOption = tip.value
    let nextOption

    if (prevOption.id === (event.target as HTMLInputElement).id) {
      nextOption = { id: null }
    } else {
      nextOption = { id: (event.target as HTMLInputElement).id }
    }

    setTip(nextOption)

    if (prevOption.id && !isPreview.value) {
      const prevOptionIndex = parseInt(prevOption.id.split("-")[1])
      console.log('prevOptionIndex', prevOptionIndex)
      cart.value = await removeTipFromCart(prevOptionIndex)
    }
    if (nextOption.id && !isPreview.value) {
      const nextOptionIndex = parseInt(nextOption.id.split("-")[1])
      console.log('nextOptionIndex', nextOptionIndex)
      cart.value = await addTipToCart(nextOptionIndex)
    }

    const cartIsEmpty = !cart.value?.items?.length
    const tipChanged = prevOption.id || nextOption.id

    if (tipChanged && !cartIsEmpty && !isPreview.value) {
      replaceCartSections('update')
    } else if (cartIsEmpty && !isPreview.value) {
      replaceCartSections('empty')
    }

    tipLoading.value = false
  }

}

async function addTipToCart(tipOptionIndex: number): Promise<void> {
  const currentItems = cart.value?.items as { id: string; quantity: number }[]
  await fetch("/cart/clear.js", { method: "POST" })
  const tipId = product.value.variants[tipOptionIndex].id
  console.log("addTipToCart", tipId)

  const formData = {
    items: [
      {
        id: tipId,
        quantity: 1,
      },
      ...currentItems,
    ],
    sections: cartSections?.map(
      (section: Section) => section.section
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

async function removeTipFromCart(tipOptionIndex: number) {
  const tipId = product.value.variants[tipOptionIndex].id
  console.log("removeTipFromCart", tipId)
  const formData = {
    updates: { [tipId]: 0 },
    sections: cartSections?.map(
      (section: Section) => section.section
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
    this.addEventListener("load", async () => {
      await handleLoad()
    })
    // eslint-disable-next-line prefer-rest-params
    return open.apply(this, arguments as any)
  }
}

async function handleLoad(): Promise<void> {
  if (!isPreview.value && !tipLoading.value) {
    console.log("handleLoad")
    const [currentCart, currentProduct] = await Promise.all([fetchCart(), fetchProduct()])
    cart.value = currentCart
    product.value = currentProduct
    const tipProduct = cart.value?.items?.find(
      (item: { handle: string }) => item.handle === "fulfillment-tip"
    )
    const currentTipOptionIndex = product.value.variants.findIndex((variant: { id: string; }) => variant.id === tipProduct?.id)
    if (currentTipOptionIndex !== -1) setTip({ id: `tip-${currentTipOptionIndex}` })
  }
}

function replaceCartSections(sectionType: string) {
  cartSections?.filter((section) => section.type === sectionType).forEach((section) => {
    console.log("Refreshing", section.id)
    replaceSection(section)
  })
}

function replaceSection(section: Section) {
  document.querySelectorAll(section.id).forEach((element) => {
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}
</script>

<style scoped>
.widget__row {
  max-width: 400px;
  display: flex;
  align-items: center;
  text-align: left;
  margin: 0 0 0 auto;
}

.widget__avatar {
  margin: 4px;
  display: inline-flex;
}

.widget__avatar-inner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: lightgrey;
}

.widget__content {
  margin: 0 10px;
  display: inline-flex;
  flex-direction: column;
  line-height: 1.5;
}

.widget__buttons {
  margin-left: auto;
  display: inline-flex;
  flex-direction: column;
  text-align: right;
}

.widget__button {
  display: inline-block;
  margin: 0.25em 0;
}

.widget__label-inner {
  align-self: center;
  font-size: 12px;
  margin: auto;
}

.widget__input:checked+.widget__label {
  border-color: v-bind("settings.selectionColor");
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
  display: none;
}

.widget__header {
  font-size: 11px;
}

.widget__subheader {
  color: #5f36d2;
  margin-top: auto;
  padding-top: 0.5em;
  font-size: 9px;
}

.widget__subheader > a {
  display: inline-block;
}

.widget__label {
  margin: 0;
  display: inline-flex;
  height: 25px;
  width: 55px;
  line-height: 1;
  text-align: center;
  cursor: pointer;
  border-style: solid;
  border-radius: v-bind("settings.cornerRadius + 'px'");
  border-width: v-bind("settings.strokeWidth + 'px'");
  border-color: v-bind("settings.strokeColor");
  background: v-bind("settings.backgroundColor");
  animation-delay: 0s;
  animation: fade-in 2s;
}

.widget__input:checked+.widget__label>.widget__label-inner {
  font-weight: bold;
}

.widget__logo {
  height: 11px;
  vertical-align: middle;
  pointer-events: none;
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

.mini .widget__wrapper {
  margin-bottom: 0;
}

.mini .widget__label {
  margin-right: 30px;
}

.settings-loading .widget__header {
  border-radius: v-bind("settings.cornerRadius + 'px'");
  background-color: lightgrey;
}

.settings-loading .widget__header > span {
  visibility: hidden;
}

.settings-loading .widget__label {
  animation-delay: 0s;
  animation: fade-out 6s, settingsloading 7s infinite;
}

.settings-loading .widget__label-inner > span {
  display: none;
}

.tip-loading .widget__input:checked+.widget__label {
  animation-delay: 0s;
  animation: 0.25s infinite alternate tiploading;
}

@keyframes tiploading {
  from {
    border-color: v-bind("settings.selectionColor");
  }

  to {
    border-color: lightgrey;
  }
}

@keyframes settingsloading {
  from {
    background-color: rgb(215, 215, 215);
  }

  to {
    background-color: rgb(185, 185, 185);
  }
}
</style>
