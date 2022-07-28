<template>
  <component
    :is="TipWidget"
    :settings="settings"
    :sections="sections"
  />
</template>

<script lang=ts setup>
import { defineProps, toRefs } from 'vue'
import TipWidget from '@/components/TipWidget.vue'
import { Settings } from '@/interfaces/Settings'
import { Section } from '@/interfaces/Section'
const props = defineProps<{
  settings: Settings;
  sections: Section[];
}>()
const { settings, sections } = toRefs(props)
</script>

<style scoped>
TipWidget {
  display: block;
}
</style>