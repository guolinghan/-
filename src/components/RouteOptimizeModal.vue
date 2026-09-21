<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowRight,
  Route,
  Sparkles,
  TriangleAlert,
  X
} from 'lucide-vue-next'
import type { RouteOptimizationPreview } from '../types/travel'

const props = defineProps<{
  open: boolean
  preview: RouteOptimizationPreview | null
}>()

const emit = defineEmits<{
  apply: []
  cancel: []
}>()

const optimizationReason = computed(() => {
  if (!props.preview) return ''

  const firstChangedFrom = props.preview.beforeLabels.findIndex(
    (label, index) => label !== props.preview?.afterLabels[index]
  )
  const previous =
    firstChangedFrom > 0
      ? props.preview.beforeLabels[firstChangedFrom - 1]
      : undefined
  const current = props.preview.beforeLabels[firstChangedFrom]
  const next = props.preview.afterLabels[firstChangedFrom]

  if (previous && current && next) {
    return `原顺序「${previous} → ${current}」存在折返，推荐调整为「${previous} → ${next}」，减少往返距离。`
  }

  return '当前顺序存在跨区域折返，推荐按照地理位置的临近关系重新排序。'
})

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open && preview"
        class="fixed inset-0 z-[96] grid place-items-center overflow-y-auto bg-slate-950/65 px-4 py-8 backdrop-blur-sm"
        @click="handleOverlayClick"
      >
        <Transition name="modal-rise" appear>
          <section
            class="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:border-white/10 dark:bg-[#182321]"
            role="dialog"
            aria-modal="true"
            aria-label="智能路线优化建议"
          >
            <header class="relative border-b border-gray-100 px-7 py-6 dark:border-white/10">
              <button
                class="focus-ring absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/10"
                type="button"
                aria-label="关闭路线优化弹窗"
                @click="emit('cancel')"
              >
                <X :size="18" />
              </button>
              <span class="grid h-11 w-11 place-items-center rounded-full bg-forest-50 text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
                <Sparkles :size="20" />
              </span>
              <h2 class="mt-4 font-display text-2xl font-semibold">发现更顺路的游览顺序</h2>
              <p class="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-slate-400">
                {{ optimizationReason }}
              </p>
            </header>

            <div class="space-y-5 px-7 py-6">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                  <p class="text-xs font-bold uppercase tracking-wider text-gray-400">
                    当前顺序
                  </p>
                  <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-300">
                    {{ preview.beforeLabels.join(' → ') }}
                  </p>
                  <p class="mt-3 text-xs text-gray-400">
                    路线直线距离约 {{ preview.beforeDistanceKm.toFixed(1) }} km
                  </p>
                </div>

                <div class="rounded-2xl border border-forest-200 bg-forest-50/70 p-4 dark:border-forest-300/20 dark:bg-forest-900/35">
                  <p class="text-xs font-bold uppercase tracking-wider text-forest-600 dark:text-forest-300">
                    推荐顺序
                  </p>
                  <p class="mt-3 text-sm leading-6 text-forest-900 dark:text-forest-100">
                    {{ preview.afterLabels.join(' → ') }}
                  </p>
                  <p class="mt-3 text-xs text-forest-700 dark:text-forest-200">
                    路线直线距离约 {{ preview.afterDistanceKm.toFixed(1) }} km
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-300/20 dark:bg-amber-300/10">
                <TriangleAlert :size="18" class="mt-0.5 shrink-0 text-amber-700 dark:text-amber-200" />
                <div>
                  <p class="text-sm font-bold text-amber-900 dark:text-amber-100">
                    预计减少约 {{ preview.improvementPercent.toFixed(1) }}% 的折返距离
                  </p>
                  <p class="mt-1 text-xs leading-5 text-amber-800/70 dark:text-amber-100/65">
                    应用后会同步重排 Day1-Day3 的景点时段，地图路线也会立即更新；
                    酒店、午餐等自定义条目、备注和用户时长都会保留。
                  </p>
                </div>
              </div>
            </div>

            <footer class="flex flex-col-reverse gap-3 border-t border-gray-100 px-7 py-6 sm:flex-row sm:justify-end dark:border-white/10">
              <button
                class="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-gray-300 dark:border-white/10 dark:text-slate-300"
                type="button"
                @click="emit('cancel')"
              >
                保持原有顺序
              </button>
              <button
                class="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-forest-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-700"
                type="button"
                @click="emit('apply')"
              >
                <Route :size="16" />
                应用推荐顺序
                <ArrowRight :size="15" />
              </button>
            </footer>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
