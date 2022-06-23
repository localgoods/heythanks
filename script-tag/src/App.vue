<template>
  <component
    :is="widgetComponent"
    :key="widgetId"
  />
</template>

<script lang=ts setup>
/* eslint-disable vue/one-component-per-file */
import { defineProps, onMounted } from 'vue'
import WidgetElement from '~/components/WidgetElement.vue'
const props = defineProps<{
  widgetId: string
}>()
let widgetComponent = WidgetElement
onMounted(async () => {
  console.log('Mounted widget id', props.widgetId)
})
</script>

<style>
WidgetElement {
  display: block;
}
</style>