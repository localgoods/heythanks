<template>
  <section>
    <div class="lg:flex lg:items-center lg:justify-between">
      <div class="mt-6 mb-2 flex-1 min-w-0">
        <h2
          class="
            text-[#7C1FBF]
            text-lg
            font-bold
            leading-7
            sm:text-xl sm:truncate
          "
        >
          Impact Map
        </h2>
      </div>
    </div>
    <div class="flex flex-col">
      <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div
            class="
              shadow
              overflow-hidden
              border-b border-gray-200
              sm:rounded-lg
            "
          >
            <div
              id="map"
              class="h-80"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import mapboxgl from "mapbox-gl"
onMounted(() => {
  new mapboxgl.Map({
    accessToken:
      "pk.eyJ1Ijoic2hhbmVqZWFybGV5IiwiYSI6ImNreDk2a3lpOTBjaXcydm12ZDk2c3gxeXUifQ.U2Uqnz-oOUMGpG-3_tr3ng",
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-98.5556199, 39.8097343],
    zoom: 2.5,
  })
  // Todo: Add markers for shops and fulfillment partners
})
</script>

<style>
.mapboxgl-control-container {
  display: none;
}
</style>