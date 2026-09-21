<script setup lang="ts">
import { Clock3, Heart, MapPin, Plus } from 'lucide-vue-next'
import type { Region, Spot } from '../types/travel'
import { withBase } from '../utils/asset'
import { formatDuration } from '../utils/trip'

const props = withDefaults(
  defineProps<{
    spot: Spot
    region?: Region
    favorite?: boolean
    planned?: boolean
    showAdd?: boolean
  }>(),
  {
    region: undefined,
    favorite: false,
    planned: false,
    showAdd: true
  }
)

const emit = defineEmits<{
  open: [spot: Spot]
  favorite: [spot: Spot]
  add: [spot: Spot]
}>()

function formatPrice(price: number) {
  return price === 0 ? '免费' : `¥${price}`
}
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-soft transition duration-500 ease-smooth hover:-translate-y-1.5 hover:border-forest-200 hover:shadow-lift dark:border-white/10 dark:bg-white/[0.055] dark:hover:border-forest-300/30"
    @click="emit('open', spot)"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5">
      <img
        class="h-full w-full object-cover transition duration-700 ease-smooth group-hover:scale-[1.045]"
        :src="withBase(spot.coverImg)"
        :alt="`${spot.name}风景`"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
      <div class="absolute left-4 top-4 flex max-w-[75%] flex-wrap gap-2">
        <span
          v-for="tag in spot.typeTags.slice(0, 2)"
          :key="tag"
          class="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-forest-800 backdrop-blur-md"
        >
          {{ tag }}
        </span>
      </div>
      <button
        class="focus-ring absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-white/85 text-gray-700 shadow-soft backdrop-blur-md transition hover:scale-105 hover:text-rose-500 dark:border-white/10 dark:bg-night/70 dark:text-white"
        type="button"
        :aria-label="favorite ? `取消收藏${spot.name}` : `收藏${spot.name}`"
        :title="favorite ? '取消收藏' : '收藏'"
        @click.stop="emit('favorite', spot)"
      >
        <Heart
          :size="18"
          :fill="favorite ? 'currentColor' : 'none'"
          :class="{ 'text-rose-500': favorite }"
        />
      </button>
      <div
        v-if="spot.tips.length"
        class="pointer-events-none absolute inset-x-4 bottom-16 rounded-xl border border-white/20 bg-slate-950/75 p-3 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100"
      >
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
          Travel tips
        </p>
        <p class="mt-2 text-[10px] leading-4 text-white/75">
          {{ spot.tips[0] }}
        </p>
      </div>
      <div class="absolute bottom-4 left-4 right-4 text-white">
        <p v-if="region" class="flex items-center gap-1.5 text-[11px] font-semibold text-white/75">
          <MapPin :size="13" />
          {{ region.name }}
        </p>
        <h3 class="mt-1 font-display text-2xl font-semibold">
          {{ spot.name }}
        </h3>
      </div>
    </div>

    <div class="p-5">
      <p class="line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-600 dark:text-slate-400">
        {{ spot.intro }}
      </p>
      <div class="mt-5 flex items-center justify-between gap-4 border-t border-gray-100 pt-5 dark:border-white/10">
        <div class="min-w-0">
          <p class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
            <Clock3 :size="14" />
            建议 {{ formatDuration(spot.recommendDuration) }}
          </p>
          <p class="mt-1 text-sm font-bold text-forest-700 dark:text-forest-200">
            {{ formatPrice(spot.price) }}
          </p>
        </div>
        <button
          v-if="showAdd"
          class="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3.5 py-2 text-xs font-bold text-forest-700 transition hover:border-forest-600 hover:bg-forest-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-forest-300/20 dark:bg-forest-900/50 dark:text-forest-100 dark:hover:border-forest-400 dark:hover:bg-forest-600"
          type="button"
          :disabled="planned"
          @click.stop="emit('add', spot)"
        >
          <Plus :size="14" />
          {{ planned ? '已规划' : '加入行程' }}
        </button>
      </div>
    </div>
  </article>
</template>
