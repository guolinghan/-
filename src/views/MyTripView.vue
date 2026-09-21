<script setup lang="ts">
import {
  CalendarDays,
  Edit3,
  Plus,
  Route,
  Trash2,
  WalletCards
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useTravelStore } from '../composables/useTravelStore'
import { getRegionById, regionList } from '../mock/destination'
import type { Trip } from '../types/travel'
import { withBase } from '../utils/asset'
import { timeSlots } from '../utils/trip'

const store = useTravelStore()
const router = useRouter()

function createNewTrip() {
  const regionId = store.currentRegionId.value || regionList[0].id
  const trip = store.createTrip(regionId)
  if (!trip) return

  router.push({
    name: 'planner',
    query: {
      tripId: trip.id
    }
  })
}

function openTrip(trip: Trip) {
  router.push({
    name: 'trip-detail',
    params: {
      tripId: trip.id
    }
  })
}

function editTrip(trip: Trip) {
  router.push({
    name: 'planner',
    query: {
      tripId: trip.id
    }
  })
}

function removeTrip(trip: Trip) {
  const confirmed = window.confirm(`确定删除「${trip.name}」吗？`)
  if (confirmed) store.deleteTrip(trip.id)
}

function tripBudget(trip: Trip) {
  return store.calculateTripBudget(trip).total
}

function tripSpotCount(trip: Trip) {
  return Object.values(trip.days).reduce(
    (total, day) =>
      total +
      timeSlots.reduce(
        (slotTotal, slot) =>
          slotTotal +
          day[slot].filter((item) => item.kind === 'spot').length,
        0
      ),
    0
  )
}

</script>

<template>
  <main class="page-shell py-14 sm:py-20">
    <div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p class="section-label">My Trips</p>
        <h1 class="section-title">我的行程</h1>
        <p class="section-copy">
          管理已经创建的三天山野路线，查看预算、景点数量和每日安排。
        </p>
      </div>
      <button
        class="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-forest-600 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-forest-700"
        type="button"
        @click="createNewTrip"
      >
        <Plus :size="17" />
        新建行程
      </button>
    </div>

    <div v-if="store.trips.value.length" class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="trip in store.trips.value"
        :key="trip.id"
        class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift dark:border-white/10 dark:bg-white/[0.055]"
      >
        <button
          class="block w-full text-left"
          type="button"
          @click="openTrip(trip)"
        >
          <div class="relative aspect-[16/9] overflow-hidden bg-gray-100">
            <img
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              :src="withBase(getRegionById(trip.regionId)?.coverImg)"
              :alt="trip.regionName"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent"></div>
            <span class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-forest-800 backdrop-blur-md">
              {{ trip.regionName }}
            </span>
            <h2 class="absolute bottom-4 left-4 right-4 font-display text-2xl font-semibold text-white">
              {{ trip.name }}
            </h2>
          </div>
        </button>

        <div class="p-5">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <span class="flex items-center gap-2 text-gray-500 dark:text-slate-400">
              <Route :size="15" />
              {{ tripSpotCount(trip) }} 个景点
            </span>
            <span class="flex items-center gap-2 text-gray-500 dark:text-slate-400">
              <WalletCards :size="15" />
              预算 ¥{{ tripBudget(trip).toLocaleString() }}
            </span>
            <span class="flex items-center gap-2 text-gray-400 dark:text-slate-500">
              <CalendarDays :size="15" />
              {{ new Date(trip.updatedAt).toLocaleDateString('zh-CN') }}
            </span>
          </div>

          <div class="mt-5 flex gap-2 border-t border-gray-100 pt-5 dark:border-white/10">
            <button
              class="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:border-forest-300 hover:text-forest-700 dark:border-white/10 dark:text-slate-300"
              type="button"
              @click="editTrip(trip)"
            >
              <Edit3 :size="14" />
              编辑
            </button>
            <button
              class="focus-ring inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-300/20 dark:hover:bg-rose-300/10"
              type="button"
              aria-label="删除行程"
              @click="removeTrip(trip)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <div
      v-else
      class="mt-10 rounded-3xl border border-dashed border-gray-300 bg-white/60 px-6 py-20 text-center dark:border-white/15 dark:bg-white/[0.03]"
    >
      <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-50 text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
        <Route :size="24" />
      </span>
      <h2 class="mt-5 font-display text-2xl font-semibold">还没有保存的行程</h2>
      <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">
        选择旅行大区，创建第一条三天山野路线。
      </p>
      <button
        class="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-forest-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-700"
        type="button"
        @click="createNewTrip"
      >
        <Plus :size="16" />
        新建行程
      </button>
    </div>
  </main>
</template>
