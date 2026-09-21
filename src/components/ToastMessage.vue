<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info } from 'lucide-vue-next'
import { useTravelStore } from '../composables/useTravelStore'

const store = useTravelStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="store.toast.value.visible"
        class="fixed left-1/2 top-5 z-[100] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-semibold shadow-lift backdrop-blur-xl"
        :class="{
          'border-forest-200 bg-white/95 text-forest-800 dark:border-forest-300/20 dark:bg-[#1b2926]/95 dark:text-forest-100':
            store.toast.value.type === 'success',
          'border-amber-200 bg-amber-50/95 text-amber-900 dark:border-amber-300/20 dark:bg-[#302719]/95 dark:text-amber-100':
            store.toast.value.type === 'warning',
          'border-gray-200 bg-white/95 text-gray-800 dark:border-white/10 dark:bg-white/10 dark:text-white':
            store.toast.value.type === 'info'
        }"
        role="status"
      >
        <CheckCircle2 v-if="store.toast.value.type === 'success'" :size="17" />
        <AlertCircle v-else-if="store.toast.value.type === 'warning'" :size="17" />
        <Info v-else :size="17" />
        <span>{{ store.toast.value.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>
