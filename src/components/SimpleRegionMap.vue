<script setup lang="ts">
import { computed } from 'vue'
import { MapPin } from 'lucide-vue-next'
import type { Spot } from '../types/travel'
import { withBase } from '../utils/asset'

const props = withDefaults(
  defineProps<{
    spots: Spot[]
    highlightId?: string
    ordered?: boolean
  }>(),
  {
    highlightId: '',
    ordered: false
  }
)

const emit = defineEmits<{
  select: [spot: Spot]
}>()

const points = computed(() => {
  if (!props.spots.length) return []

  const lngValues = props.spots.map((spot) => spot.location.lng)
  const latValues = props.spots.map((spot) => spot.location.lat)
  const minLng = Math.min(...lngValues)
  const maxLng = Math.max(...lngValues)
  const minLat = Math.min(...latValues)
  const maxLat = Math.max(...latValues)
  const lngRange = maxLng - minLng || 0.01
  const latRange = maxLat - minLat || 0.01

  return props.spots.map((spot) => ({
    spot,
    x: 10 + ((spot.location.lng - minLng) / lngRange) * 80,
    y: 86 - ((spot.location.lat - minLat) / latRange) * 72
  }))
})

const linePoints = computed(() =>
  points.value.map((point) => `${point.x},${point.y}`).join(' ')
)
</script>

<template>
  <div
    class="relative h-full min-h-[360px] overflow-visible rounded-3xl border border-gray-200 bg-[#edf3ef] dark:border-white/10 dark:bg-[#17221f]"
  >
    <div
      class="absolute inset-0 overflow-hidden rounded-3xl opacity-50 dark:opacity-35"
      style="background-image: linear-gradient(rgba(59,107,95,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,107,95,0.09) 1px, transparent 1px); background-size: 42px 42px"
    ></div>
    <div class="absolute left-5 top-5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700 backdrop-blur-md dark:border-white/10 dark:bg-night/70 dark:text-forest-200">
      Simple route map
    </div>

    <svg
      v-if="ordered && points.length > 1"
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        :points="linePoints"
        fill="none"
        stroke="rgba(59,107,95,0.55)"
        stroke-width="0.8"
        stroke-dasharray="2 1.5"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <button
      v-for="point in points"
      :key="point.spot.id"
      class="group absolute -translate-x-1/2 -translate-y-1/2"
      :style="{
        left: `${point.x}%`,
        top: `${point.y}%`
      }"
      type="button"
      @click="emit('select', point.spot)"
    >
      <span
        class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white shadow-soft transition duration-300 group-hover:scale-110 dark:border-night"
        :class="
          highlightId === point.spot.id
            ? 'bg-rose-500'
            : 'bg-forest-600'
        "
      >
        <MapPin :size="16" />
      </span>
      <span
        class="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 w-52 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-lift opacity-0 transition group-hover:opacity-100 dark:border-white/10 dark:bg-[#1b2926]"
      >
        <span class="flex items-center gap-2">
          <img
            class="h-8 w-8 rounded-lg object-cover"
            :src="withBase(point.spot.coverImg)"
            :alt="point.spot.name"
          />
          <span class="min-w-0 truncate text-xs font-bold text-ink dark:text-white">
            {{ point.spot.name }}
          </span>
        </span>
        <span class="mt-2 block text-[10px] leading-4 text-gray-500 dark:text-slate-400">
          {{ point.spot.location.address }}
        </span>
      </span>
    </button>

    <div
      v-if="!points.length"
      class="absolute inset-0 grid place-items-center text-sm text-gray-400"
    >
      暂无可展示的景点位置
    </div>
  </div>
</template>
