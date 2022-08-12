<template>
  <section>
    <div class="lg:flex lg:items-center lg:justify-between">
      <div class="mt-6 flex-1 min-w-0">
        <h2
          class="
            text-[#7C1FBF]
            text-lg
            font-bold
            leading-7
            sm:text-xl sm:truncate
          "
        >
          Shops
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
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="
                      px-6
                      py-3
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    class="
                      px-6
                      py-3
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    Fulfillment
                  </th>
                  <th
                    scope="col"
                    class="
                      px-6
                      py-3
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    Plan
                  </th>
                  <th
                    scope="col"
                    class="
                      px-6
                      py-3
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    Current / Total
                  </th>
                  <th
                    scope="col"
                    class="
                      px-6
                      py-3
                      text-left text-xs
                      font-medium
                      text-gray-500
                      uppercase
                      tracking-wider
                    "
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="relative px-6 py-3"
                  >
                    <span class="sr-only">More</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="shop in shopList"
                  :key="shop.id"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img
                          class="h-10 w-10 rounded-full"
                          src="shopify.png"
                          alt=""
                        >
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ shop.name || "–" }}
                        </div>
                        <div
                          v-if="shop.name"
                          class="text-sm text-gray-500"
                        >
                          {{ shop.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ shop.fulfillment_service || "–" }}
                    </div>
                    <div
                      v-if="shop.fulfillment_service"
                      class="text-sm text-gray-500"
                    >
                      {{ shop.fulfillment_manual ? "Manual" : "Professional" }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ shop.active_plan || "–" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ shop.current_month_tips / shop.total_tips || "–" }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <StatusChip :status="shop.status" />
                  </td>
                  <td
                    class="
                      px-6
                      py-4
                      whitespace-nowrap
                      text-right text-sm
                      font-medium
                    "
                  >
                    <a
                      href="#"
                      class="text-indigo-600 hover:text-indigo-900"
                    >More</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import StatusChip from "@/components/StatusChip.vue"
import useShops from '@/composables/shops'
import { computed } from "vue"
const { shops } = useShops()
const shopList = computed(() => {
  return shops.value?.map((shop: { installed: boolean; access_token: string; onboarded: boolean; requires_update: boolean; }) => {
    return {
      ...shop,
      status: !shop.installed
        ? "Uninstalled"
        : !shop.access_token
        ? "Requires access"
        : !shop.onboarded
        ? "Onboarding"
        : shop.requires_update
        ? "Requires update"
        : "Active",
    }
  })
})
</script>