<template>
  <div class="grid grid-cols-2 gap-8">
    <ImpactMap />
    <FulfillmentPartnersList />
  </div>

  <div class="grid grid-cols-1">
    <ShopsList />
  </div>
</template>

<script setup lang="ts">
import ShopsList from "@/components/ShopsList.vue"
import FulfillmentPartnersList from "@/components/FulfillmentPartnersList.vue"
</script>