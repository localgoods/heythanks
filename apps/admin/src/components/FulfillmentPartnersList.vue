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
          Fulfillment Partners
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
                    Current / Total Tips
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
                  v-for="fulfillment in fulfillments"
                  :key="fulfillment.id"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img
                          class="h-10 w-10 rounded-full"
                          :src="fulfillment.logo"
                          alt=""
                        >
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ fulfillment.name || "–" }}
                        </div>
                        <div
                          v-if="fulfillment.name"
                          class="text-sm text-gray-500"
                        >
                          {{ fulfillment.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      <!-- {{
                        fulfillment.current_month_tips /
                          fulfillment.total_tips || "–"
                      }} -->
                      "–"
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <StatusChip status="Integrated" />
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
const fulfillments = [
  {
    id: 1,
    name: "ShipHero",
    email: "support@shiphero.io",
    logo: "https://storage.googleapis.com/heythanks-app-images/ShipHero.png",
  },
  {
    id: 2,
    name: "ShipBob",
    email: "support@shipbob.io",
    logo: "https://storage.googleapis.com/heythanks-app-images/ShipBob.png",
  },
]
</script>