<template>
  <article class="widget__article">
    <span class="widget__header">{{ props.labelText }}</span>
    <span class="widget__subheader no-wrap">
      Powered by
      <object
        data="https://storage.googleapis.com/heythanks-app-images/HeyThanksLogo.svg"
        type="image/svg+xml"
        class="widget__logo"
      />
      <div
        id="tooltip-text"
        ref="tooltipText"
        class="widget__tooltip"
        :class="{ 'bottom': tooltipPosition === 'top', 'top': tooltipPosition === 'bottom' }"
      >
        <svg
          viewBox="0 0 20 20"
          height="12"
          width="12"
        >
          <path
            d="M10 2a8 8 0 100 16 8 8 0 000-16zm-7.071.929A10 10 0 1117.07 17.07 10 10 0 012.93 2.93z"
            fill="#5f36d2"
          />
          <path
            d="M11.126 13.002H8.99V11.86c.01-1.966.492-2.254 1.374-2.782.093-.056.19-.114.293-.178.73-.459 1.292-1.038 1.292-1.883 0-.948-.743-1.564-1.666-1.564-.852 0-1.657.398-1.712 1.533H6.305c.06-2.294 1.877-3.487 3.99-3.487 2.306 0 3.894 1.447 3.894 3.488 0 1.382-.695 2.288-1.806 2.952l-.237.144c-.79.475-1.009.607-1.02 1.777v1.142zm.17 2.012a1.344 1.344 0 01-1.327 1.328 1.32 1.32 0 01-1.227-1.834 1.318 1.318 0 011.227-.81c.712 0 1.322.592 1.328 1.316h-.001z"
            fill="#5f36d2"
          />
        </svg>
        <span class="widget__tooltip-text top">{{ props.tooltipText }}</span>
      </div>
    </span>
  </article>
</template>

<script setup lang="ts">
import { Ref, defineProps, ref, onMounted } from 'vue'

const props = defineProps<{
    labelText: string;
    tooltipText: string;
}>()

const tooltipText: Ref<HTMLSpanElement | null> = ref(null)
const tooltipPosition = ref("top")
let ticking = false

function setupScrollListener() {
    document.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const pageHalf = getVisiblePageHalf()
                console.log("Setting tooltip position", pageHalf)
                setTooltipPosition(pageHalf)
                ticking = false
            })

            ticking = true
        }
    })
}

function getVisiblePageHalf() {
    const offset = getMaxWidgetTop()
    const halfPage = window.innerHeight / 2
    if (offset < halfPage) {
        return "top"
    } else {
        return "bottom"
    }
}

function getMaxWidgetTop() {
    return Math.max(...Array.from(document.querySelectorAll('#heythanks-widget')).map(element => element.getBoundingClientRect().top))
}

function setTooltipPosition(pageHalf: string) {
    tooltipPosition.value = pageHalf
}

onMounted(() => {
    setupScrollListener()
})

</script>