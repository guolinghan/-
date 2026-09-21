<script setup lang="ts">
import { computed } from 'vue'
import { Heart } from 'lucide-vue-next'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import RegionSwitchModal from './components/RegionSwitchModal.vue'
import ToastMessage from './components/ToastMessage.vue'
import { useTravelStore } from './composables/useTravelStore'
import { getRegionById } from './mock/destination'

const store = useTravelStore()

const currentRegionName = computed(
  () => store.currentRegion.value?.name ?? '当前大区'
)
const pendingRegionName = computed(
  () =>
    (store.pendingRegionId.value &&
      getRegionById(store.pendingRegionId.value)?.name) ||
    '新大区'
)
</script>

<template>
  <div class="min-h-screen">
    <NavBar />

    <RouterView v-slot="{ Component, route }">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="-translate-y-1 opacity-0"
      >
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>

    <footer class="border-t border-gray-200/70 py-8 dark:border-white/10">
      <div
        class="page-shell flex flex-col items-center justify-between gap-4 text-center text-xs text-gray-500 sm:flex-row sm:text-left dark:text-slate-400"
      >
        <p>© 2026 山野行 · Vue 3 + TypeScript + Tailwind CSS</p>
        <p class="flex items-center gap-1.5">
          本地 Mock 数据
          <Heart :size="13" class="text-rose-500" fill="currentColor" />
          无后端依赖
        </p>
      </div>
    </footer>

    <RegionSwitchModal
      :open="store.regionSwitchOpen.value"
      :current-region="currentRegionName"
      :next-region="pendingRegionName"
      :itinerary-count="store.currentTripSpotCount.value"
      @confirm="store.confirmRegionSwitch"
      @cancel="store.cancelRegionSwitch"
    />
    <ToastMessage />
  </div>
</template>
