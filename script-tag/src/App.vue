<template>
  <component
    :is="TipWidget"
    :settings="settings"
  />
</template>

<script lang=ts setup>
import { defineProps, toRefs, watch } from 'vue'
import TipWidget from '~/components/TipWidget.vue'
import { Settings } from '~/interfaces/Settings'
const props = defineProps<{
  css: string;
  settings: Settings;
}>()
const { css, settings } = toRefs(props)
watch(css, () => {
  console.log('New css value')
})
</script>

<style scoped>
TipWidget {
  display: block;
}
</style>