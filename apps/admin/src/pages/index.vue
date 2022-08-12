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
import ImpactMap from "@/components/ImpactMap.vue"
import FulfillmentPartnersList from "@/components/FulfillmentPartnersList.vue"
import ShopsList from "@/components/ShopsList.vue"
</script>