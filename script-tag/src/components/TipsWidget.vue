<script setup lang="ts">

import HeyThanks from '../assets/HeyThanks.svg'

const { settings, allProducts } = defineProps<{
  settings: Record<string, any>
  allProducts: Record<string, any>
}>()

</script>

<template>
  <div class="tips__wrapper">
    <article class="tips__article">
      <span class="tips__header">{{ settings.labelText }}</span>
      <span class="tips__subheader no-wrap">
        Powered by
        <HeyThanks height="calc(1.8 * 12px)" width="auto" class="tips__logo" />
        <div class="tips__tooltip">
          <svg viewBox="0 0 20 20" xmlns="http:www.w3.org/2000/svg" height="12" width="12">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-7.071.929A10 10 0 1117.07 17.07 10 10 0 012.93 2.93z"
              fill="#5f36d2" />
            <path
              d="M11.126 13.002H8.99V11.86c.01-1.966.492-2.254 1.374-2.782.093-.056.19-.114.293-.178.73-.459 1.292-1.038 1.292-1.883 0-.948-.743-1.564-1.666-1.564-.852 0-1.657.398-1.712 1.533H6.305c.06-2.294 1.877-3.487 3.99-3.487 2.306 0 3.894 1.447 3.894 3.488 0 1.382-.695 2.288-1.806 2.952l-.237.144c-.79.475-1.009.607-1.02 1.777v1.142zm.17 2.012a1.344 1.344 0 01-1.327 1.328 1.32 1.32 0 01-1.227-1.834 1.318 1.318 0 011.227-.81c.712 0 1.322.592 1.328 1.316h-.001z"
              fill="#5f36d2" />
          </svg>
          <span class="tips__tooltip-text top">{{ settings.tooltipText }}</span>
        </div>
      </span>
    </article>

    <input type="radio" id="radio-1" name="tip-option" class="tips__input">
    <label for="radio-1" class="tips__label animated unselectable">
      <div class="tips__label-inner">
        <svg class="tips__radio-check animated" viewBox="0 0 6 4" fill="none" xmlns="http:www.w3.org/2000/svg">
          <path d="M1.20005 1.99992L2.86819 3.48173" stroke="white" />
          <line x1="2.19643" y1="3.44637" x2="4.89644" y2="0.746374" stroke="white" />
        </svg>
        <span class="tips__radio-control animated"></span>
        <span v-if="settings.firstEmoji !== 'None'" class="tips__radio-emoji">{{ settings.firstEmoji }}</span>
        <span v-if="allProducts['fulfillment-tip'].variants[0]" class="tips__radio-price">{{
          allProducts["fulfillment-tip"].variants[0].price
        }}</span>
      </div>
    </label>

    <input type="radio" id="radio-2" name="tip-option" class="tips__input">
    <label for="radio-2" class="tips__label animated unselectable">
      <div class="tips__label-inner">
        <svg class="tips__radio-check animated" viewBox="0 0 6 4" fill="none" xmlns="http:www.w3.org/2000/svg">
          <path d="M1.20005 1.99992L2.86819 3.48173" stroke="white" />
          <line x1="2.19643" y1="3.44637" x2="4.89644" y2="0.746374" stroke="white" />
        </svg>
        <span class="tips__radio-control animated"></span>
        <span v-if="settings.secondEmoji !== 'None'" class="tips__radio-emoji">{{ settings.secondEmoji }}</span>
        <span v-if="allProducts['fulfillment-tip'].variants[1]" class="tips__radio-price">{{
          allProducts["fulfillment-tip"].variants[1].price
        }}</span>
      </div>
    </label>
  </div>
</template>

<style scoped>

.tips__label {
  border-radius: v-bind("settings.cornerRadius + 'px'");
  border-width: v-bind("settings.strokeWidth + 'px'");
  border-color: v-bind("settings.strokeColor");
  background: v-bind("settings.backgroundColor");
}

.tips__radio-control {
  border-width: v-bind("settings.strokeWidth + 'px'");
  border-color: v-bind("settings.strokeColor");
}

.tips__input:checked + .tips__label {
  border-color: v-bind("settings.selectionColor");
}

.tips__input:checked + .tips__label > .tips__label-inner > .tips__radio-control {
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
}

.invisible {
  opacity: 0;
  width: 0;
  height: 0;
}

.tips__wrapper {
  position: relative;
  padding-bottom: 5rem;
  border-bottom: 0.1rem solid rgba(var(--color-foreground), 0.08);
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 10px;
}

.tips__article {
  display: flex;
  flex-direction: column;
  grid-column: 4 / 23;
  grid-row: 1;
  text-align: right;
  margin: 0 2rem 0 auto;
  max-width: 250px;
}

.tips__header {
  font-size: 14px;
}

.tips__subheader {
  color: #5f36d2;
  margin-top: auto;
  padding-top: 0.75rem;
  font-size: 12px;
}

.tips__label {
  padding: 2px;
  text-align: center;
  height: 60px;
  width: 60px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-style: solid;
}

.tips__label>.tips__label-inner>span {
  display: block;
}

.tips__label[for="radio-1"] {
  grid-column: 23;
  grid-row: 1;
}

.tips__label[for="radio-2"] {
  grid-column: 24;
  grid-row: 1;
}

.tips__radio-control {
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

.tips__input+.tips__label>.tips__label-inner>.tips__radio-check {
  display: none;
}

.tips__input:checked+.tips__label>.tips__label-inner>.tips__radio-check {
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

.tips__input:checked+.tips__label>.tips__label-inner>.tips__radio-price {
  font-weight: bold;
}

.tips__radio-emoji {
  align-self: center;
  font-size: 25px;
  transform: scale(0.75);
  line-height: calc(1.5 * 0.75);
  margin: auto;
  margin-top: 50%;
  margin-bottom: -75%;
  transform: translateY(-75%);
}

.tips__radio-price {
  align-self: center;
  font-size: 12px;
  margin: auto;
  margin-top: 50%;
  transform: translateY(-50%);
}

@media screen and (max-width: 414px) {
  .tips__wrapper {
    gap: 10px 0;
  }

  .tips__article {
    grid-column: 4 / 23;
    grid-row: 1 / 3;
    text-align: left;
    margin: auto;
  }

  .tips__label[for="radio-1"] {
    grid-column: 24;
    grid-row: 1;
  }

  .tips__label[for="radio-2"] {
    grid-column: 24;
    grid-row: 2;
  }
}

.tips__logo {
  height: calc(1.8 * 12px);
  width: auto;
  vertical-align: bottom;
}

.tips__tooltip {
  position: relative;
  height: 12px;
  display: inline-block;
}

.tips__tooltip .tips__tooltip-text {
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

.tips__tooltip .tips__tooltip-text.top {
  bottom: 150%;
}

.tips__tooltip .tips__tooltip-text:after {
  content: "";
  position: absolute;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
}

.tips__tooltip .tips__tooltip-text.top:after {
  top: 100%;
  border-color: black transparent transparent transparent;
}

.tips__tooltip:hover .tips__tooltip-text {
  visibility: visible;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

</style>
