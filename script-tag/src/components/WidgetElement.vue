<script setup lang="ts">
import Logo from '~/assets/HeyThanks.svg'
import useCart from '~/composables/cart'

const { settings, setTipOption, tipOptionLoading } = useCart()

/**
 * Returns the price in dollar display format
 * 
 * @param price {number} Price of the tip in cents (e.g. 100)
 * @returns {string} Price in dollar display format (e.g. "$1.00")
 */
function price(price: number): string {
  const dollars = Math.floor(price / 100)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(dollars)
}

</script>

<template>
  <div
    ref="widget"
    class="widget__wrapper"
  >
    <article class="widget__article">
      <span class="widget__header">{{ settings.labelText }}</span>
      <span class="widget__subheader no-wrap">
        Powered by
        <Logo class="widget__logo" />
        <div
          id="tooltip-text"
          class="widget__tooltip"
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
          <span class="widget__tooltip-text top">{{ settings.tooltipText }}</span>
        </div>
      </span>
    </article>

    <input
      id="radio-1"
      type="radio"
      name="tip-option"
      class="widget__input invisible"
      :disabled="tipOptionLoading"
      @click="setTipOption($event)"
      @keyup="setTipOption($event)"
    >
    <label
      for="radio-1"
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
      :disabled="tipOptionLoading"
      @click="setTipOption($event)"
      @keyup="setTipOption($event)"
    >
    <label
      for="radio-2"
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

<style scoped>
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

.widget__input:checked+.widget__label {
  border-color: v-bind("settings.selectionColor");
}

.widget__input:checked+.widget__label>.widget__label-inner>.widget__radio-control {
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

.widget__wrapper {
  position: relative;
  border-bottom: 0.1rem solid rgba(var(--color-foreground), 0.08);
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 10px;
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
}

.widget__label>.widget__label-inner>span {
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

.widget__input+.widget__label>.widget__label-inner>.widget__radio-check {
  display: none;
}

.widget__input:checked+.widget__label>.widget__label-inner>.widget__radio-check {
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

.widget__input:checked+.widget__label>.widget__label-inner>.widget__radio-price {
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

/* Todo make this dynamic to differ between mini carts and full page carts */
.widget__wrapper {
  gap: 2px 0;
  padding-bottom: 0;
}

.widget__article {
  grid-column: 4 / 23;
  grid-row: 1 / 3;
  text-align: left;
  margin: auto;
}

.widget__label {
  margin-right: 30px;
}

.widget__label[for="radio-1"] {
  grid-column: 24;
  grid-row: 1;
}

.widget__label[for="radio-2"] {
  grid-column: 24;
  grid-row: 2;
}

/* Media queries */

/* Todo fix this for full screen cart */
/* 415px and larger (tablets, desktop) */
/* @media screen and (min-width: 415px) {
  .widget__wrapper {
    padding-bottom: 5rem;
  }
} */

/* 414px and smaller (phones) */
@media screen and (max-width: 414px) {
  .widget__wrapper {
    gap: 10px 0;
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
}
</style>
