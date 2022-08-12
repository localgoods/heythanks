<template>
  <Suspense>
    <component :is="DefaultLayout">
      <RouterView />
    </component>
  </Suspense>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import '@/assets/css/tailwind.css'
</script>
