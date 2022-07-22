<template>
  <component
    :is="TipWidget"
    :settings="props.settings"
    :sections="props.sections"
    :worker-img="props.workerImg"
  />
</template>

<script lang=ts setup>
import { defineProps } from 'vue'
import TipWidget from '@/components/TipWidget.vue'
import { Settings } from '@/interfaces/Settings'
import { Section } from '@/interfaces/Section'
const props = defineProps<{
  settings: Settings;
  sections: Section[];
  workerImg: string;
}>()
</script>

<style scoped>
TipWidget {
  display: block;
}
</style>