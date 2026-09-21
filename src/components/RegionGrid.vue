<script setup lang="ts">
import { ArrowRight, CalendarDays, Check, MapPin } from 'lucide-vue-next'
import type { Region } from '../types/travel'
import { withBase } from '../utils/asset'

defineProps<{
  regions: Region[]
  currentRegionId?: string | null
}>()

const emit = defineEmits<{
  select: [regionId: string]
}>()
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
    <button
      v-for="region in regions"
      :key="region.id"
      class="focus-ring group overflow-hidden rounded-2xl border bg-white text-left shadow-soft transition duration-500 ease-smooth hover:-translate-y-1.5 hover:shadow-lift dark:bg-white/[0.055]"
      :class="
        currentRegionId === region.id
          ? 'border-forest-400 ring-2 ring-forest-500/15 dark:border-forest-300/50'
          : 'border-gray-200/80 hover:border-forest-200 dark:border-white/10 dark:hover:border-forest-300/30'
      "
      type="button"
      @click="emit('select', region.id)"
    >
      <div class="relative aspect-[16/11] overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          class="h-full w-full object-cover transition duration-700 ease-smooth group-hover:scale-[1.05]"
          :src="withBase(region.coverImg)"
          :alt="`${region.name}风景`"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/5 to-transparent"></div>
        <span
          v-if="currentRegionId === region.id"
          class="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-forest-800 shadow-soft backdrop-blur-md"
        >
          <Check :size="13" />
          当前大区
        </span>
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <p class="flex items-center gap-1.5 text-[11px] font-semibold text-white/75">
            <MapPin :size="13" />
            3 日山野路线
          </p>
          <h3 class="mt-1 font-display text-2xl font-semibold">
            {{ region.name }}
          </h3>
        </div>
      </div>

      <div class="p-5">
        <p class="min-h-[48px] text-sm leading-6 text-gray-600 dark:text-slate-400">
          {{ region.desc }}
        </p>
        <div class="mt-5 flex items-center justify-between border-t border-gray-100 pt-5 dark:border-white/10">
          <span class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
            <CalendarDays :size="14" />
            {{ region.spotCount }} 个景点
          </span>
          <span class="inline-flex items-center gap-1 text-xs font-bold text-forest-700 dark:text-forest-200">
            选择大区
            <ArrowRight :size="14" class="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  </div>
</template>
