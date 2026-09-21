<script setup lang="ts">
import { computed, ref } from 'vue'
import { LayoutGrid, Map, Search, SlidersHorizontal } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import SimpleRegionMap from '../components/SimpleRegionMap.vue'
import SpotCard from '../components/SpotCard.vue'
import { useTravelStore } from '../composables/useTravelStore'
import {
  destinationList,
  getRegionBySpotId,
  regionList
} from '../mock/destination'
import type { Spot } from '../types/travel'

const store = useTravelStore()
const route = useRoute()
const router = useRouter()
const search = ref('')
const selectedTag = ref('全部')
const selectedRegionId = ref('all')
const viewMode = ref<'cards' | 'map'>('cards')

const tagOptions = computed(() => {
  const tags = new Set(destinationList.flatMap((spot) => spot.typeTags))
  return ['全部', ...Array.from(tags)]
})

const filteredSpots = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return destinationList.filter((spot) => {
    const matchesRegion =
      selectedRegionId.value === 'all' ||
      spot.regionId === selectedRegionId.value
    const matchesKeyword =
      !keyword || spot.name.toLowerCase().includes(keyword)
    const matchesTag =
      selectedTag.value === '全部' ||
      spot.typeTags.includes(selectedTag.value)
    return matchesRegion && matchesKeyword && matchesTag
  })
})

function selectRegionFilter(regionId: string) {
  selectedRegionId.value = regionId
}

function ensureLogin(message: string, redirect: string) {
  if (store.requireLogin(message)) return true
  router.push({
    name: 'login',
    query: {
      redirect
    }
  })
  return false
}

function openSpot(spot: Spot) {
  router.push({
    name: 'spot-detail',
    params: {
      id: spot.id
    }
  })
}

function toggleFavorite(spot: Spot) {
  if (!ensureLogin('收藏景点前请先登录', route.fullPath)) return
  store.toggleFavorite(spot.id)
}

function addSpot(spot: Spot) {
  if (!ensureLogin('添加行程前请先登录', route.fullPath)) return
  const added = store.addSpotToTrip(spot)
  if (added) router.push({ name: 'planner' })
}
</script>

<template>
  <main class="page-shell py-14 sm:py-20">
    <div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p class="section-label">Destinations</p>
        <h1 class="section-title">浏览山野目的地</h1>
        <p class="section-copy">
          搜索景点名称，按雪山、草原、徒步、森林等标签筛选，快速找到想去的地方。
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-slate-400">
          当前找到 {{ filteredSpots.length }} 个景点
        </span>
        <div class="flex rounded-full border border-gray-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.05]">
          <button
            class="focus-ring grid h-8 w-8 place-items-center rounded-full transition"
            :class="
              viewMode === 'cards'
                ? 'bg-forest-600 text-white'
                : 'text-gray-400 hover:text-forest-700'
            "
            type="button"
            aria-label="卡片视图"
            @click="viewMode = 'cards'"
          >
            <LayoutGrid :size="15" />
          </button>
          <button
            class="focus-ring grid h-8 w-8 place-items-center rounded-full transition"
            :class="
              viewMode === 'map'
                ? 'bg-forest-600 text-white'
                : 'text-gray-400 hover:text-forest-700'
            "
            type="button"
            aria-label="地图视图"
            @click="viewMode = 'map'"
          >
            <Map :size="15" />
          </button>
        </div>
      </div>
    </div>

    <div class="glass-panel mt-9 rounded-2xl p-5 sm:p-6">
      <div class="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <label class="block">
          <span class="mb-2.5 block text-xs font-semibold text-gray-600 dark:text-slate-300">
            搜索景点
          </span>
          <span class="relative block">
            <Search :size="17" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="search"
              class="field pl-11"
              type="search"
              placeholder="例如：四姑娘山、太湖源"
            />
          </span>
        </label>

        <label class="block lg:w-64">
          <span class="mb-2.5 flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300">
            <SlidersHorizontal :size="14" />
            类型标签
          </span>
          <select v-model="selectedTag" class="field appearance-none">
            <option v-for="tag in tagOptions" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
        </label>
      </div>

      <div class="mt-6 flex flex-wrap gap-2 border-t border-gray-200/70 pt-5 dark:border-white/10">
        <button
          class="focus-ring rounded-full border px-4 py-2 text-xs font-bold transition"
          :class="
            selectedRegionId === 'all'
              ? 'border-forest-600 bg-forest-600 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-forest-300 hover:text-forest-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300'
          "
          type="button"
          @click="selectRegionFilter('all')"
        >
          全部大区
        </button>
        <button
          v-for="region in regionList"
          :key="region.id"
          class="focus-ring rounded-full border px-4 py-2 text-xs font-bold transition"
          :class="
            selectedRegionId === region.id
              ? 'border-forest-600 bg-forest-600 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-forest-300 hover:text-forest-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300'
          "
          type="button"
          @click="selectRegionFilter(region.id)"
        >
          {{ region.name }}
        </button>
      </div>
    </div>

    <div
      v-if="filteredSpots.length && viewMode === 'map'"
      class="mt-9"
    >
      <SimpleRegionMap
        :spots="filteredSpots"
        @select="openSpot"
      />
    </div>

    <div
      v-else-if="filteredSpots.length"
      class="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      <SpotCard
        v-for="spot in filteredSpots"
        :key="spot.id"
        :spot="spot"
        :region="getRegionBySpotId(spot.id)"
        :favorite="store.isFavorite(spot.id)"
        :planned="store.isSpotPlanned(spot.id)"
        @open="openSpot"
        @favorite="toggleFavorite"
        @add="addSpot"
      />
    </div>

    <div
      v-else
      class="mt-9 rounded-3xl border border-dashed border-gray-300 bg-white/60 px-6 py-20 text-center dark:border-white/15 dark:bg-white/[0.03]"
    >
      <p class="font-display text-2xl font-semibold">没有找到匹配的景点</p>
      <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">
        尝试更换关键词或类型标签
      </p>
    </div>
  </main>
</template>
