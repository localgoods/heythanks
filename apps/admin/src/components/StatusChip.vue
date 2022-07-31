<template>
  <span
    v-if="color === 'green'"
    class="
      px-2
      inline-flex
      text-xs
      leading-5
      font-semibold
      rounded-full
      bg-green-100
      text-green-800
    "
  >
    {{ status }}
  </span>
  <span
    v-else-if="color === 'yellow'"
    class="
      px-2
      inline-flex
      text-xs
      leading-5
      font-semibold
      rounded-full
      bg-yellow-100
      text-yellow-800
    "
  >
    {{ status }}
  </span>
  <span
    v-else-if="color === 'gray'"
    class="
      px-2
      inline-flex
      text-xs
      leading-5
      font-semibold
      rounded-full
      bg-gray-100
      text-gray-800
    "
  >
    {{ status }}
  </span>
  <span
    v-else-if="color === 'pink'"
    class="
      px-2
      inline-flex
      text-xs
      leading-5
      font-semibold
      rounded-full
      bg-pink-100
      text-pink-800
    "
  >
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { toRefs, defineProps, computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const { status } = toRefs(props)
// Requires update and Onboarding are yellow
const color = computed(() => {
  const colorDict = {
    "Active": "green",
    "Integrated": "green",
    "Uninstalled": "gray",
    "Requires access": "pink",
    "Requires update": "yellow",
    "Onboarding": "yellow",
    "Unknown": "yellow"
  }
  const statusKey = status.value as keyof typeof colorDict
  return colorDict[statusKey || "Unknown"]
})
</script>
