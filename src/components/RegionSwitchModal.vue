<script setup lang="ts">
import { TriangleAlert, X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open?: boolean
    currentRegion?: string
    nextRegion?: string
    itineraryCount?: number
  }>(),
  {
    open: false,
    currentRegion: '',
    nextRegion: '',
    itineraryCount: 0
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[95] grid place-items-center bg-slate-950/65 px-4 py-8 backdrop-blur-sm"
        @click="handleOverlayClick"
      >
        <Transition name="modal-rise" appear>
          <section
            class="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:border-white/10 dark:bg-[#182321]"
            role="dialog"
            aria-modal="true"
            aria-label="确认切换旅行大区"
          >
            <div class="relative border-b border-gray-100 px-7 pb-5 pt-7 dark:border-white/10">
              <button
                class="focus-ring absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                type="button"
                aria-label="关闭大区切换弹窗"
                @click="emit('cancel')"
              >
                <X :size="18" />
              </button>
              <span class="grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">
                <TriangleAlert :size="20" />
              </span>
              <h2 class="mt-4 font-display text-2xl font-semibold">切换旅行大区？</h2>
              <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
                当前行程包含 {{ itineraryCount }} 个景点。切换到
                <strong class="text-ink dark:text-white">{{ nextRegion }}</strong>
                后，{{ currentRegion }} 的全部行程会被清空。
              </p>
            </div>
            <div class="flex flex-col-reverse gap-3 px-7 py-6 sm:flex-row sm:justify-end">
              <button
                class="focus-ring rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
                type="button"
                @click="emit('cancel')"
              >
                保留当前行程
              </button>
              <button
                class="focus-ring rounded-full bg-forest-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-700"
                type="button"
                @click="emit('confirm')"
              >
                清空并切换
              </button>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
