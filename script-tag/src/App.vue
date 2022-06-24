<template>
  <component
    :is="WidgetElement"
    :key="widgetId"
    :settings="settings"
  />
</template>

<script lang=ts setup>
import { Settings } from "~/composables/cart"
import { defineProps, toRefs } from 'vue'
import WidgetElement from '~/components/WidgetElement.vue'
const props = defineProps<{
  widgetId: string;
  settings: Settings;
}>()
const { widgetId, settings } = toRefs(props)
</script>

<style>
WidgetElement {
  display: block;
}
</style>