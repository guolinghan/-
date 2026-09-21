<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarDays,
  CarFront,
  Clipboard,
  Clock3,
  Edit3,
  MapPinned,
  WalletCards
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useTravelStore } from '../composables/useTravelStore'
import { getRegionById } from '../mock/destination'
import type { DayKey } from '../types/travel'
import { withBase } from '../utils/asset'
import {
  calculateDaySchedule,
  formatClock,
  formatDuration,
  getStopDurationMinutes,
  timeSlotMeta,
  timeSlots
} from '../utils/trip'

const route = useRoute()
const router = useRouter()
const store = useTravelStore()

const trip = computed(() => store.getTripById(String(route.params.tripId)))
const region = computed(() =>
  trip.value ? getRegionById(trip.value.regionId) : undefined
)
const budget = computed(() => store.calculateTripBudget(trip.value ?? null))

function daySchedule(day: DayKey) {
  return trip.value
    ? calculateDaySchedule(
        timeSlots.flatMap((slot) => trip.value!.days[day][slot]),
        day
      )
    : []
}

function stopTitle(stop: ReturnType<typeof daySchedule>[number]['stop']) {
  return stop.kind === 'spot' ? stop.spot.name : stop.title
}

function stopImage(stop: ReturnType<typeof daySchedule>[number]['stop']) {
  return stop.kind === 'spot' ? stop.spot.coverImg : ''
}

function dayTips(day: DayKey) {
  if (!trip.value) return []
  return [
    ...new Set(
      timeSlots.flatMap((slot) =>
        trip.value!.days[day][slot].flatMap((item) =>
          item.kind === 'spot' ? item.spotTips ?? [] : []
        )
      )
    )
  ]
}

async function copyTrip() {
  if (!trip.value) return

  try {
    await navigator.clipboard.writeText(store.exportTripText(trip.value))
    store.showToast('行程文本已复制', 'success')
  } catch (error) {
    store.showToast('复制失败，请检查浏览器权限', 'warning')
  }
}

function editTrip() {
  if (!trip.value) return
  router.push({
    name: 'planner',
    query: {
      tripId: trip.value.id
    }
  })
}
</script>

<template>
  <main v-if="trip" class="page-shell py-14 sm:py-20">
    <div class="relative overflow-hidden rounded-3xl bg-forest-700 text-white">
      <img
        v-if="region"
        class="absolute inset-0 h-full w-full object-cover opacity-30"
        :src="withBase(region.coverImg)"
        :alt="region.name"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-forest-900/95 to-forest-700/65"></div>
      <div class="relative z-10 p-7 sm:p-10">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-forest-200">
          Trip Overview
        </p>
        <h1 class="mt-3 font-display text-3xl font-semibold sm:text-5xl">{{ trip.name }}</h1>
        <div class="mt-6 flex flex-wrap gap-5 text-sm text-white/75">
          <span class="flex items-center gap-2">
            <MapPinned :size="16" />
            {{ trip.regionName }}
          </span>
          <span class="flex items-center gap-2">
            <WalletCards :size="16" />
            总预算 ¥{{ budget.total.toLocaleString() }}
          </span>
          <span class="flex items-center gap-2">
            <CalendarDays :size="16" />
            {{ new Date(trip.updatedAt).toLocaleDateString('zh-CN') }}
          </span>
        </div>
        <div class="mt-8 flex flex-wrap gap-3">
          <button
            class="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-50"
            type="button"
            @click="editTrip"
          >
            <Edit3 :size="16" />
            编辑行程
          </button>
          <button
            class="focus-ring inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            type="button"
            @click="copyTrip"
          >
            <Clipboard :size="16" />
            复制导出
          </button>
        </div>
      </div>
    </div>

    <div class="mt-10 space-y-8">
      <section
        v-for="day in store.dayKeys"
        :key="day"
        class="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft sm:p-8 dark:border-white/10 dark:bg-white/[0.05]"
      >
        <div class="flex items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-white/10">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-forest-600 dark:text-forest-300">
              {{ day }}
            </p>
            <h2 class="mt-1 font-display text-2xl font-semibold">
              {{ daySchedule(day as DayKey).length ? '今日安排' : '自由活动' }}
            </h2>
          </div>
          <span class="rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
            {{ daySchedule(day as DayKey).length }} 项安排
          </span>
        </div>

        <div
          v-if="dayTips(day as DayKey).length"
          class="mt-5 rounded-2xl border border-forest-200/70 bg-forest-50/70 p-4 dark:border-forest-300/15 dark:bg-forest-900/35"
        >
          <p class="text-xs font-bold text-forest-700 dark:text-forest-200">当日贴士汇总</p>
          <ul class="mt-2 space-y-1.5">
            <li
              v-for="tip in dayTips(day as DayKey)"
              :key="tip"
              class="text-xs leading-5 text-forest-900/70 dark:text-forest-100/65"
            >
              · {{ tip }}
            </li>
          </ul>
        </div>

        <div v-if="daySchedule(day as DayKey).length" class="relative mt-6 space-y-5">
          <article
            v-for="(entry, index) in daySchedule(day as DayKey)"
            :key="entry.stop.planId"
            class="grid gap-4 rounded-2xl border border-gray-200 bg-canvas/60 p-4 sm:grid-cols-[120px_1fr] dark:border-white/10 dark:bg-white/[0.035]"
          >
            <img
              v-if="entry.stop.kind === 'spot'"
              class="h-28 w-full rounded-xl object-cover sm:h-full"
              :src="withBase(entry.stop.spot.coverImg)"
              :alt="entry.stop.spot.name"
            />
            <div
              v-else
              class="grid h-28 place-items-center rounded-xl bg-forest-50 text-forest-700 dark:bg-forest-900/50 dark:text-forest-200"
            >
              <CalendarDays :size="28" />
            </div>
            <div>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {{ timeSlotMeta[entry.slot].label }} ·
                    {{ formatClock(entry.arrivalMinutes) }} -
                    {{ formatClock(entry.endMinutes) }}
                  </p>
                  <h3 class="mt-1 font-display text-xl font-semibold">
                    {{ stopTitle(entry.stop) }}
                  </h3>
                </div>
                <span
                  v-if="entry.stop.kind === 'spot'"
                  class="text-sm font-bold text-forest-700 dark:text-forest-200"
                >
                  {{ entry.stop.spot.price === 0 ? '免费' : `¥${entry.stop.spot.price}` }}
                </span>
              </div>
              <div v-if="entry.stop.kind === 'spot'" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="tag in entry.stop.spot.typeTags"
                  :key="tag"
                  class="rounded-full bg-forest-50 px-2.5 py-1 text-[10px] font-bold text-forest-700 dark:bg-forest-900/60 dark:text-forest-200"
                >
                  {{ tag }}
                </span>
              </div>
              <p
                v-if="entry.stop.kind === 'spot'"
                class="mt-3 line-clamp-2 text-xs leading-6 text-gray-500 dark:text-slate-400"
              >
                {{ entry.stop.spot.intro }}
              </p>
              <div class="mt-4 flex flex-wrap gap-5 text-xs text-gray-500 dark:text-slate-400">
                <span class="flex items-center gap-1.5">
                  <Clock3 :size="14" />
                  实际 {{ formatDuration(getStopDurationMinutes(entry.stop)) }}
                  <template v-if="entry.stop.userDuration !== entry.stop.recommendDuration">
                    · 推荐 {{ formatDuration(entry.stop.recommendDuration) }}
                  </template>
                </span>
                <span v-if="entry.driveToNextMinutes" class="flex items-center gap-1.5">
                  <CarFront :size="14" />
                  下一站约 {{ formatDuration(entry.driveToNextMinutes) }}
                </span>
              </div>
              <p
                v-if="entry.stop.remark"
                class="mt-3 whitespace-pre-line rounded-lg bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600 dark:bg-white/[0.04] dark:text-slate-300"
              >
                备注：{{ entry.stop.remark }}
              </p>
              <div
                v-if="entry.stop.kind === 'spot' && entry.stop.spotTips?.length"
                class="mt-3 rounded-lg border border-gray-100 px-3 py-2 dark:border-white/10"
              >
                <p class="text-[10px] font-bold text-gray-500 dark:text-slate-400">景点贴士</p>
                <ul class="mt-1.5 space-y-1">
                  <li
                    v-for="tip in entry.stop.spotTips"
                    :key="tip"
                    class="text-[10px] leading-4 text-gray-500 dark:text-slate-400"
                  >
                    · {{ tip }}
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>

        <p v-else class="mt-6 rounded-2xl border border-dashed border-gray-300 px-5 py-10 text-center text-sm text-gray-400 dark:border-white/15 dark:text-slate-500">
          这一天还没有安排景点
        </p>
        <p
          v-if="trip.dayNotes[day as DayKey]"
          class="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-600 dark:bg-white/[0.04] dark:text-slate-300"
        >
          当日补充：{{ trip.dayNotes[day as DayKey] }}
        </p>
      </section>
    </div>

    <section class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div class="glass-panel rounded-2xl p-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">门票合计</p>
        <p class="mt-2 font-display text-2xl font-semibold">¥{{ budget.tickets.toLocaleString() }}</p>
      </div>
      <div class="glass-panel rounded-2xl p-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">食宿费用</p>
        <p class="mt-2 font-display text-2xl font-semibold">¥{{ budget.foodLodging.toLocaleString() }}</p>
      </div>
      <div class="rounded-2xl border border-forest-200 bg-forest-50 p-6 dark:border-forest-300/20 dark:bg-forest-900/40">
        <p class="text-xs font-semibold uppercase tracking-wider text-forest-600 dark:text-forest-300">总预算</p>
        <p class="mt-2 font-display text-2xl font-semibold text-forest-800 dark:text-forest-100">
          ¥{{ budget.total.toLocaleString() }}
        </p>
      </div>
    </section>
  </main>

  <main v-else class="page-shell py-24 text-center">
    <p class="font-display text-3xl font-semibold">没有找到这条行程</p>
    <RouterLink class="mt-4 inline-block text-sm font-bold text-forest-700" to="/my-trip">
      返回我的行程
    </RouterLink>
  </main>
</template>
