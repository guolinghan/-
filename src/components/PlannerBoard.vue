<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import draggable from 'vuedraggable'
import {
  Armchair,
  CalendarRange,
  Check,
  ChevronDown,
  Copy,
  GripVertical,
  Heart,
  Hotel,
  LockKeyhole,
  MapPinned,
  Moon,
  Mountain,
  Plus,
  Sparkles,
  Trash2,
  UtensilsCrossed
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import RouteOptimizeModal from './RouteOptimizeModal.vue'
import SimpleRegionMap from './SimpleRegionMap.vue'
import { useTravelStore } from '../composables/useTravelStore'
import { regionList } from '../mock/destination'
import type {
  CustomStopType,
  CustomSourceItem,
  DayKey,
  Spot,
  SpotTripStop,
  TimeSlot,
  TripStop
} from '../types/travel'
import { withBase } from '../utils/asset'
import {
  calculateDaySchedule,
  formatClock,
  formatDuration,
  getStopDurationMinutes,
  timeSlotMeta,
  timeSlots
} from '../utils/trip'

const store = useTravelStore()
const router = useRouter()
const expandedItems = ref<string[]>([])
const customForm = reactive<{
  day: DayKey
  slot: TimeSlot
  title: string
  userDuration: number
}>({
  day: 'Day1',
  slot: 'morning',
  title: '',
  userDuration: 60
})

const customTypes: CustomStopType[] = ['hotel', 'lunch', 'dinner', 'rest']
const customItems = customTypes.map((value) => ({
  value
}))
const customMeta: Record<
  CustomStopType,
  { label: string; icon: typeof Hotel }
> = {
  hotel: {
    label: '酒店入住',
    icon: Hotel
  },
  lunch: {
    label: '午餐',
    icon: UtensilsCrossed
  },
  dinner: {
    label: '晚餐',
    icon: UtensilsCrossed
  },
  rest: {
    label: '休息',
    icon: Armchair
  }
}

const isLoggedIn = computed(() => Boolean(store.currentUser.value))
const hasRegion = computed(() => Boolean(store.currentRegion.value))
const currentTrip = computed(() => store.currentTrip.value)
const plannerEnabled = computed(
  () => isLoggedIn.value && hasRegion.value && Boolean(currentTrip.value)
)
const plannedSpots = computed(
  () =>
    (currentTrip.value
      ? store.dayKeys.flatMap((day) =>
          timeSlots.flatMap((slot) =>
            currentTrip.value!.days[day][slot]
              .filter((stop) => stop.kind === 'spot')
              .map((stop) => (stop as SpotTripStop).spot)
          )
        )
      : []) as Spot[]
)

function selectRegion(regionId: string) {
  store.requestRegionChange(regionId)
}

function createTrip() {
  if (!store.currentRegion.value) return
  const trip = store.createTrip(store.currentRegion.value.id)
  if (!trip) return
  router.replace({
    name: 'planner',
    query: {
      tripId: trip.id
    }
  })
}

function addSpot(spot: Spot) {
  const added = store.addSpotToTrip(spot)
  if (added) {
    router.replace({
      name: 'planner',
      query: {
        tripId: store.currentTrip.value?.id
      }
    })
  }
}

function openLogin() {
  router.push({
    name: 'login',
    query: {
      redirect: '/planner'
    }
  })
}

function canPutToSlot(day: DayKey, to: any, from: any) {
  if (to.el === from.el) return true
  if (to.el?.dataset?.day && to.el.dataset.day === from.el?.dataset?.day) {
    return true
  }
  if (from.el?.dataset?.kind === 'custom') return true
  return countDaySpots(day) < 4
}

function countDaySpots(day: DayKey) {
  if (!currentTrip.value) return 0
  return timeSlots.reduce(
    (total, slot) =>
      total +
      currentTrip.value!.days[day][slot].filter(
        (stop) => stop.kind === 'spot'
      ).length,
    0
  )
}

function countDayCustom(day: DayKey) {
  if (!currentTrip.value) return 0
  return timeSlots.reduce(
    (total, slot) =>
      total +
      currentTrip.value!.days[day][slot].filter(
        (stop) => stop.kind === 'custom'
      ).length,
    0
  )
}

function slotGroup(day: DayKey, slot: TimeSlot) {
  return {
    name: 'destination',
    put: (to: any, from: any) => canPutToSlot(day, to, from)
  }
}

function createSpotClone(spot: Spot) {
  return store.createDragClone(spot)
}

function createCustomClone(item: { value: CustomStopType }) {
  return store.createCustomDragClone(item.value)
}

function createUserCustomClone(item: CustomSourceItem) {
  return store.createUserCustomDragClone(item)
}

function daySchedule(day: DayKey) {
  if (!currentTrip.value) return []
  return calculateDaySchedule(
    timeSlots.flatMap((slot) => currentTrip.value!.days[day][slot]),
    day
  )
}

function scheduleFor(day: DayKey, stop: TripStop) {
  return daySchedule(day).find((entry) => entry.stop.planId === stop.planId)
}

function stopTitle(stop: TripStop) {
  return stop.kind === 'spot' ? stop.spot.name : stop.title
}

function stopImage(stop: TripStop) {
  return stop.kind === 'spot' ? stop.spot.coverImg : ''
}

function formatPrice(price: number) {
  return price === 0 ? '免费' : `¥${price}`
}

function isExpanded(planId: string) {
  return expandedItems.value.includes(planId)
}

function toggleExpanded(planId: string) {
  expandedItems.value = isExpanded(planId)
    ? expandedItems.value.filter((id) => id !== planId)
    : [...expandedItems.value, planId]
}

function addCustomFromForm() {
  if (!customForm.title.trim()) return
  const added = store.addCustomSourceItem(
    customForm.title,
    customForm.userDuration,
    customForm.day,
    customForm.slot
  )
  if (added) {
    customForm.title = ''
    customForm.userDuration = 60
  }
}

function dayTips(day: DayKey) {
  return [
    ...new Set(
      timeSlots.flatMap((slot) =>
        currentTrip.value!.days[day][slot].flatMap((item) =>
          item.kind === 'spot' ? item.spotTips ?? [] : []
        )
      )
    )
  ]
}

function customLabel(type: CustomStopType) {
  return customMeta[type].label
}

function customIcon(type: CustomStopType) {
  return customMeta[type].icon
}

function slotLabel(slot: TimeSlot) {
  return timeSlotMeta[slot].label
}
</script>

<template>
  <section class="planner-page relative overflow-visible py-16 sm:py-24">
    <div class="mx-auto w-full max-w-[1800px] px-8">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="section-label">Trip Planner</p>
          <h1 class="section-title">按天与时段规划山野行程</h1>
          <p class="section-copy">
            景点可拖入上午、下午、傍晚、夜间，也支持酒店、午餐、晚餐和休息等自定义安排。
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:w-[380px]">
          <div class="glass-panel rounded-2xl p-4">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">总预算</p>
            <p class="mt-1 font-display text-2xl font-semibold text-forest-700 dark:text-forest-200">
              ¥{{ store.currentTripBudget.value.total.toLocaleString() }}
            </p>
          </div>
          <div class="glass-panel rounded-2xl p-4">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">景点</p>
            <p class="mt-1 font-display text-2xl font-semibold">
              {{ store.currentTripSpotCount.value }}
              <span class="text-xs font-normal text-gray-400">个</span>
            </p>
          </div>
        </div>
      </div>

      <div class="glass-panel mt-12 rounded-2xl p-6 sm:p-7">
        <div class="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-forest-600 dark:text-forest-300">
              第一步
            </p>
            <h2 class="mt-1 font-display text-xl font-semibold">选择旅行大区</h2>
          </div>
          <p v-if="store.currentRegion.value" class="text-xs text-gray-500 dark:text-slate-400">
            当前：{{ store.currentRegion.value.name }} · {{ store.currentRegionSpots.value.length }} 个景点
          </p>
          <p v-else class="text-xs font-semibold text-amber-600 dark:text-amber-300">
            尚未选择大区
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            v-for="region in regionList"
            :key="region.id"
            class="focus-ring group flex items-center gap-3 overflow-hidden rounded-xl border p-2.5 text-left transition duration-300"
            :class="
              store.currentRegionId.value === region.id
                ? 'border-forest-500 bg-forest-50 shadow-soft dark:border-forest-300/50 dark:bg-forest-900/50'
                : 'border-gray-200 bg-canvas/70 hover:-translate-y-0.5 hover:border-forest-300 dark:border-white/10 dark:bg-white/[0.03]'
            "
            type="button"
            @click="selectRegion(region.id)"
          >
            <img
              class="h-14 w-16 shrink-0 rounded-lg object-cover"
              :src="withBase(region.coverImg)"
              :alt="region.name"
              loading="lazy"
            />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-bold">{{ region.name }}</span>
              <span class="mt-1 block text-[10px] text-gray-500 dark:text-slate-400">
                {{ region.spotCount }} 个景点
              </span>
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="!isLoggedIn"
        class="mt-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-amber-300/20 dark:bg-amber-300/[0.07]"
      >
        <div class="flex items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
            <LockKeyhole :size="18" />
          </span>
          <div>
            <p class="text-sm font-bold text-amber-900 dark:text-amber-100">登录后解锁拖拽保存</p>
            <p class="mt-1 text-xs text-amber-800/70 dark:text-amber-100/60">
              登录后可以保存行程、收藏景点并查看完整预算。
            </p>
          </div>
        </div>
        <button
          class="focus-ring shrink-0 rounded-full bg-amber-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700"
          type="button"
          @click="openLogin"
        >
          立即登录
        </button>
      </div>

      <div class="mt-14 flex flex-col gap-8 lg:flex-row">
        <aside class="w-full min-w-0 space-y-10 lg:shrink-0 lg:basis-[320px] lg:max-w-[320px]">
          <div>
            <div class="mb-4 flex items-center justify-between">
              <div>
              <h2 class="planner-section-title text-sm font-bold text-ink dark:text-white">本区景点素材</h2>
                <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  {{ hasRegion ? '拖拽或点击加入行程' : '请先选择旅行大区' }}
                </p>
              </div>
              <span class="rounded-full bg-forest-50 px-3 py-1 text-[11px] font-bold text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
                {{ store.currentRegionSpots.value.length }} 个
              </span>
            </div>

            <draggable
              v-if="hasRegion"
              :list="store.currentRegionSpots.value"
              :group="{ name: 'destination', pull: 'clone', put: false }"
              :clone="createSpotClone"
              item-key="id"
              :disabled="!isLoggedIn || !currentTrip"
              data-kind="spot"
              handle=".drag-handle"
              ghost-class="drag-ghost"
              chosen-class="drag-chosen"
              class="grid max-h-[620px] gap-x-4 gap-y-0 overflow-y-auto pr-2 sm:grid-cols-2 xl:grid-cols-1"
            >
              <template #item="{ element }">
                <article
                  class="group my-3 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:border-forest-200 dark:border-white/10 dark:bg-white/[0.055]"
                >
                  <div
                    class="drag-handle grid h-9 w-9 shrink-0 cursor-grab place-items-center rounded-lg text-gray-400 transition group-hover:bg-forest-50 group-hover:text-forest-700 active:cursor-grabbing dark:group-hover:bg-forest-900/60 dark:group-hover:text-forest-200"
                    :class="{ 'pointer-events-none opacity-35': store.isSpotPlanned(element.id) }"
                    title="拖拽到右侧时段"
                  >
                    <GripVertical :size="17" />
                  </div>
                  <img
                    class="h-14 w-16 shrink-0 rounded-lg object-cover"
                    :src="withBase(element.coverImg)"
                    :alt="element.name"
                    loading="lazy"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-bold">{{ element.name }}</p>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <span
                        v-for="tag in element.typeTags.slice(0, 2)"
                        :key="tag"
                        class="rounded-full bg-forest-50 px-2 py-0.5 text-[9px] font-bold text-forest-700 dark:bg-forest-900/60 dark:text-forest-200"
                      >
                        {{ tag }}
                      </span>
                    </div>
                    <p class="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
                      {{ formatPrice(element.price) }}
                    </p>
                  </div>
                  <button
                    class="focus-ring grid h-8 w-8 place-items-center rounded-full bg-forest-50 text-forest-700 transition hover:bg-forest-600 hover:text-white disabled:opacity-40 dark:bg-forest-900/60 dark:text-forest-200"
                    type="button"
                    :disabled="store.isSpotPlanned(element.id)"
                    :aria-label="`将${element.name}加入行程`"
                    @click="addSpot(element)"
                  >
                    <Plus :size="15" />
                  </button>
                </article>
              </template>
            </draggable>

            <div v-else class="rounded-2xl border border-dashed border-gray-300 px-5 py-12 text-center dark:border-white/15">
              <Mountain :size="24" class="mx-auto text-gray-400" />
              <p class="mt-3 text-xs font-bold text-gray-500 dark:text-slate-400">请先选择旅行大区</p>
            </div>
          </div>

          <div>
            <h2 class="planner-section-title text-sm font-bold text-ink dark:text-white">自定义安排</h2>
            <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">拖入任意时段</p>
            <draggable
              :list="customItems"
              :group="{ name: 'destination', pull: 'clone', put: false }"
              :clone="createCustomClone"
              item-key="value"
              :disabled="!plannerEnabled"
              data-kind="custom"
              handle=".custom-handle"
              class="mt-4 grid grid-cols-2 gap-4"
            >
              <template #item="{ element }">
                <article class="flex min-h-[84px] flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
                  <component
                    :is="customIcon(element.value)"
                    :size="18"
                    class="text-forest-600 dark:text-forest-300"
                  />
                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-xs font-bold">{{ customLabel(element.value) }}</span>
                    <GripVertical :size="14" class="custom-handle cursor-grab text-gray-400" />
                  </div>
                </article>
              </template>
            </draggable>

            <div
              v-if="store.customSourceItems.value.length"
              class="mt-6"
            >
              <p class="mb-4 text-xs font-bold text-gray-500 dark:text-slate-400">
                我的自定义素材
              </p>
              <draggable
                :list="store.customSourceItems.value"
                :group="{ name: 'destination', pull: 'clone', put: false }"
                :clone="createUserCustomClone"
                item-key="id"
                :disabled="!plannerEnabled"
                data-kind="custom"
                handle=".custom-handle"
                class="space-y-3"
              >
                <template #item="{ element }">
                  <article class="flex min-h-[84px] items-center gap-3 rounded-xl border border-dashed border-forest-300/70 bg-forest-50/50 p-4 dark:border-forest-300/20 dark:bg-forest-900/25">
                    <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-forest-700 shadow-sm dark:bg-white/[0.08] dark:text-forest-200">
                      <Armchair :size="17" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-xs font-bold">{{ element.title }}</p>
                      <p class="mt-1 text-[9px] text-gray-500 dark:text-slate-400">
                        {{ element.preferredDay }} · {{ slotLabel(element.preferredSlot) }} ·
                        {{ formatDuration(element.userDuration) }}
                      </p>
                    </div>
                    <GripVertical :size="14" class="custom-handle shrink-0 cursor-grab text-gray-400" />
                    <button
                      class="focus-ring grid h-7 w-7 shrink-0 place-items-center rounded-full text-gray-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-300/10"
                      type="button"
                      aria-label="删除自定义素材卡片"
                      @click.stop="store.removeCustomSourceItem(element.id)"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </article>
                </template>
              </draggable>
            </div>

            <div class="mt-7 space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <div>
                <p class="text-xs font-bold">手动新增条目</p>
                <p class="mt-1 text-[9px] leading-4 text-gray-500 dark:text-slate-400">
                  Day 和时段仅作为预填参考，提交后生成左侧待拖拽卡片。
                </p>
              </div>
              <input
                v-model="customForm.title"
                class="field py-2 text-xs"
                type="text"
                placeholder="例如：早餐、赶路、还车"
              />
              <div class="grid grid-cols-2 gap-2">
                <select v-model="customForm.day" class="field py-2 text-xs">
                  <option v-for="day in store.dayKeys" :key="day" :value="day">
                    {{ day }}
                  </option>
                </select>
                <select v-model="customForm.slot" class="field py-2 text-xs">
                  <option v-for="slot in timeSlots" :key="slot" :value="slot">
                    {{ timeSlotMeta[slot].label }}
                  </option>
                </select>
              </div>
              <label class="flex items-center gap-2">
                <span class="text-[10px] text-gray-500">时长</span>
                <input
                  v-model.number="customForm.userDuration"
                  class="field py-2 text-xs"
                  type="number"
                  min="1"
                  step="15"
                />
                <span class="text-[10px] text-gray-400">分钟</span>
              </label>
              <button
                class="focus-ring flex w-full items-center justify-center gap-2 rounded-full bg-forest-600 px-4 py-2.5 text-xs font-bold text-white"
                type="button"
                @click="addCustomFromForm"
              >
                <Plus :size="14" />
                添加自定义条目
              </button>
            </div>
          </div>
        </aside>

        <div v-if="currentTrip" class="w-full min-w-0 flex-1">
          <div class="mb-6 flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.05]">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">当前行程</p>
              <h2 class="mt-1 font-display text-xl font-semibold">{{ currentTrip.name }}</h2>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <label class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-500 dark:text-slate-400">食宿</span>
                <span class="relative">
                  <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">¥</span>
                  <input
                    class="field w-28 py-2 pl-7 text-sm"
                    type="number"
                    min="0"
                    step="100"
                    :value="currentTrip.foodLodging"
                    @input="store.setFoodLodging(Number(($event.target as HTMLInputElement).value))"
                  />
                </span>
              </label>
              <button
                class="focus-ring inline-flex items-center gap-2 rounded-full bg-forest-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-forest-700"
                type="button"
                @click="store.requestRouteOptimization"
              >
                <Sparkles :size="14" />
                智能优化顺序
              </button>
            </div>
          </div>

          <div class="min-w-0 pb-4">
            <div class="flex flex-wrap gap-6">
              <div
                v-for="day in store.dayKeys"
                :key="day"
                class="flex min-h-[760px] w-full shrink-0 flex-col rounded-2xl border border-gray-200 bg-canvas/80 p-5 dark:border-white/10 dark:bg-night/55 sm:min-w-[300px] md:basis-[calc(50%-0.75rem)] md:max-w-[calc(50%-0.75rem)] min-[1440px]:basis-[calc(33.333%-1rem)] min-[1440px]:max-w-[calc(33.333%-1rem)]"
              >
                <div class="mb-5 flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-white/10">
                  <div>
                    <p class="planner-day-title flex items-center gap-2 text-sm font-black text-ink dark:text-white">
                      <CalendarRange :size="16" class="text-forest-600 dark:text-forest-300" />
                      {{ day }}
                    </p>
                    <p class="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
                      行程安排
                    </p>
                  </div>
                  <span
                    class="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    :class="
                      store.calculateDayStats(currentTrip, day).crowded
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-300/10 dark:text-rose-200'
                        : 'bg-white text-gray-500 dark:bg-white/10 dark:text-slate-300'
                    "
                  >
                    {{ countDaySpots(day) }}/4 景点
                    <span v-if="countDayCustom(day)">
                      · {{ countDayCustom(day) }} 安排
                    </span>
                  </span>
                </div>

                <div class="mt-0 space-y-0">
                  <div
                    v-for="slot in timeSlots"
                    :key="slot"
                    class="mb-6 rounded-xl border border-gray-200/80 bg-white/70 p-4 last:mb-0 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div class="mb-3 flex items-center justify-between px-1">
                      <p class="text-[10px] font-bold text-gray-500 dark:text-slate-400">
                        {{ timeSlotMeta[slot].label }}
                      </p>
                      <p class="text-[9px] text-gray-400">
                        {{ formatClock(timeSlotMeta[slot].startMinutes) }}
                      </p>
                    </div>
                    <draggable
                      v-model="currentTrip.days[day][slot]"
                      :data-day="day"
                      :data-slot="slot"
                      :group="slotGroup(day, slot)"
                      item-key="planId"
                      class="min-h-[140px] space-y-0 p-4"
                      ghost-class="drag-ghost"
                      chosen-class="drag-chosen"
                      :disabled="!plannerEnabled"
                      @change="store.handlePlannerChange(day, slot, $event)"
                    >
                      <template #item="{ element, index }">
                        <article
                          class="group my-3 rounded-xl border border-gray-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/[0.06]"
                          :class="{ 'opacity-60': element.isDone }"
                        >
                          <div class="flex items-center gap-2.5">
                            <button
                              class="focus-ring grid h-6 w-6 shrink-0 place-items-center rounded-full border transition"
                              :class="
                                element.isDone
                                  ? 'border-forest-600 bg-forest-600 text-white'
                                  : 'border-gray-300 text-transparent dark:border-white/20'
                              "
                              type="button"
                              aria-label="标记完成"
                              @click="store.toggleTripItemDone(day, slot, index)"
                            >
                              <Check :size="12" />
                            </button>
                            <img
                              v-if="element.kind === 'spot'"
                              class="h-10 w-11 shrink-0 rounded-lg object-cover"
                              :src="withBase(stopImage(element))"
                              :alt="stopTitle(element)"
                            />
                            <div
                              v-else
                              class="grid h-10 w-11 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700 dark:bg-forest-900/60 dark:text-forest-200"
                            >
                              <component :is="customIcon(element.customType)" :size="17" />
                            </div>
                            <div class="min-w-0 flex-1">
                              <p
                                class="truncate text-xs font-bold"
                                :class="{ 'line-through': element.isDone }"
                              >
                                {{ stopTitle(element) }}
                              </p>
                              <p class="mt-1 text-[9px] text-gray-500 dark:text-slate-400">
                                {{ formatDuration(getStopDurationMinutes(element)) }}
                                <template v-if="scheduleFor(day, element)">
                                  · {{ formatClock(scheduleFor(day, element)!.arrivalMinutes) }} -
                                  {{ formatClock(scheduleFor(day, element)!.endMinutes) }}
                                </template>
                              </p>
                            </div>
                            <div class="flex shrink-0 items-center">
                              <button
                                class="focus-ring grid h-7 w-7 place-items-center rounded-full text-gray-400 transition hover:text-forest-700"
                                type="button"
                                aria-label="编辑条目"
                                @click="toggleExpanded(element.planId)"
                              >
                                <ChevronDown
                                  :size="13"
                                  :class="{ 'rotate-180': isExpanded(element.planId) }"
                                />
                              </button>
                              <button
                                class="focus-ring grid h-7 w-7 place-items-center rounded-full text-gray-400 transition hover:text-forest-700"
                                type="button"
                                aria-label="复制条目"
                                @click="store.duplicateTripItem(day, slot, index)"
                              >
                                <Copy :size="12" />
                              </button>
                              <button
                                class="focus-ring grid h-7 w-7 place-items-center rounded-full text-gray-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-300/10"
                                type="button"
                                aria-label="从行程移除"
                                @click="store.removeTripStop(day, slot, index)"
                              >
                                <Trash2 :size="13" />
                              </button>
                            </div>
                          </div>

                          <div v-if="isExpanded(element.planId)" class="mt-3 space-y-3 border-t border-gray-100 pt-3 dark:border-white/10">
                            <div class="grid grid-cols-3 gap-2">
                              <label>
                                <span class="mb-1 block text-[9px] text-gray-400">用户时长</span>
                                <input
                                  class="field px-2 py-1.5 text-[10px]"
                                  type="number"
                                  min="1"
                                  step="15"
                                  :value="element.userDuration"
                                  @change="store.setTripItemDuration(day, slot, index, Number(($event.target as HTMLInputElement).value))"
                                />
                              </label>
                              <label>
                                <span class="mb-1 block text-[9px] text-gray-400">锁定开始</span>
                                <input
                                  class="field px-2 py-1.5 text-[10px]"
                                  type="time"
                                  :value="element.startTime"
                                  @change="store.setTripItemTime(day, slot, index, 'startTime', ($event.target as HTMLInputElement).value)"
                                />
                              </label>
                              <label>
                                <span class="mb-1 block text-[9px] text-gray-400">锁定结束</span>
                                <input
                                  class="field px-2 py-1.5 text-[10px]"
                                  type="time"
                                  :value="element.endTime"
                                  @change="store.setTripItemTime(day, slot, index, 'endTime', ($event.target as HTMLInputElement).value)"
                                />
                              </label>
                            </div>
                            <label class="block">
                              <span class="mb-1 block text-[9px] text-gray-400">备注</span>
                              <textarea
                                class="field min-h-[64px] resize-y px-3 py-2 text-[10px]"
                                :value="element.remark"
                                placeholder="填写集合点、预约信息或补充说明"
                                @change="store.setTripItemRemark(day, slot, index, ($event.target as HTMLTextAreaElement).value)"
                              ></textarea>
                            </label>
                            <div
                              v-if="element.kind === 'spot' && element.spotTips?.length"
                              class="rounded-lg bg-forest-50/70 p-2.5 dark:bg-forest-900/40"
                            >
                              <p class="text-[9px] font-bold text-forest-700 dark:text-forest-200">景点贴士</p>
                              <ul class="mt-1.5 space-y-1">
                                <li
                                  v-for="tip in element.spotTips"
                                  :key="tip"
                                  class="text-[9px] leading-4 text-forest-900/70 dark:text-forest-100/65"
                                >
                                  · {{ tip }}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </article>
                      </template>
                    </draggable>
                    <div
                      v-if="!currentTrip.days[day][slot].length"
                      class="grid min-h-[96px] place-items-center rounded-lg border border-dashed border-gray-200 px-4 py-6 text-[10px] text-gray-400 dark:border-white/10"
                    >
                      拖入{{ timeSlotMeta[slot].label }}安排
                    </div>
                  </div>
                </div>

                <p
                  v-if="store.calculateDayStats(currentTrip, day).crowded"
                  class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-[10px] font-semibold leading-4 text-rose-700 dark:bg-rose-300/10 dark:text-rose-200"
                >
                  当前安排超过 10 小时，建议减少景点或拆分到其他日期。
                </p>

                <div class="mt-6 rounded-xl border border-forest-200/70 bg-forest-50/60 p-4 dark:border-forest-300/15 dark:bg-forest-900/30">
                  <p class="text-[10px] font-bold text-forest-700 dark:text-forest-200">
                    当日贴士汇总
                  </p>
                  <ul v-if="dayTips(day).length" class="mt-2 space-y-1">
                    <li
                      v-for="tip in dayTips(day)"
                      :key="tip"
                      class="text-[9px] leading-4 text-forest-900/70 dark:text-forest-100/65"
                    >
                      · {{ tip }}
                    </li>
                  </ul>
                  <p v-else class="mt-2 text-[9px] text-gray-400">添加景点后自动汇总贴士</p>
                  <textarea
                    class="field mt-3 min-h-[56px] resize-y px-3 py-2 text-[10px]"
                    :value="currentTrip.dayNotes[day]"
                    placeholder="补充当日统一提醒"
                    @change="store.setDayNote(day, ($event.target as HTMLTextAreaElement).value)"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <section class="route-map relative mt-8 h-[420px] overflow-visible">
            <div class="mb-4 flex items-center gap-2">
              <MapPinned :size="18" class="text-forest-600 dark:text-forest-300" />
              <h2 class="font-display text-xl font-semibold">已规划景点路线</h2>
            </div>
            <SimpleRegionMap
              :spots="plannedSpots"
              class="h-full"
              ordered
              @select="router.push({ name: 'spot-detail', params: { id: $event.id } })"
            />
          </section>
        </div>

        <div
          v-else
          class="flex min-h-[640px] w-full min-w-0 flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/60 px-8 text-center dark:border-white/15 dark:bg-white/[0.03]"
        >
          <span class="grid h-14 w-14 place-items-center rounded-full bg-forest-50 text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
            <CalendarRange :size="24" />
          </span>
          <h2 class="mt-5 font-display text-2xl font-semibold">创建一条新行程</h2>
          <p class="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-slate-400">
            选择旅行大区后创建行程，再拖拽景点和自定义安排。
          </p>
          <button
            class="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-forest-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-700"
            type="button"
            @click="createTrip"
          >
            <Plus :size="16" />
            新建当前大区行程
          </button>
        </div>
      </div>
    </div>

    <RouteOptimizeModal
      :open="store.routeOptimizationOpen.value"
      :preview="store.routeOptimizationPreview.value"
      @apply="store.applyRouteOptimization"
      @cancel="store.cancelRouteOptimization"
    />
  </section>
</template>

<style scoped>
/* Planner 页面字体层级：
   正文 14px，卡片标题 16px，Day/分区标题及统计文字同步放大。 */
.planner-page :deep(.text-xs) {
  font-size: 15px !important;
  line-height: 1.5 !important;
}

.planner-page :deep(.text-sm) {
  font-size: 17px !important;
  line-height: 1.45 !important;
}

.planner-page :deep([class*='text-[9px]']) {
  font-size: 12px !important;
  line-height: 1.4 !important;
}

.planner-page :deep([class*='text-[10px]']) {
  font-size: 13px !important;
  line-height: 1.4 !important;
}

.planner-page :deep([class*='text-[11px]']) {
  font-size: 14px !important;
  line-height: 1.4 !important;
}

.planner-page :deep(.font-display.text-xl) {
  font-size: 19px !important;
}

.planner-page :deep(.font-display.text-2xl) {
  font-size: 27px !important;
}

.planner-page :deep(.planner-section-title),
.planner-page :deep(.planner-day-title) {
  font-size: 18px !important;
  line-height: 1.35 !important;
}
</style>
