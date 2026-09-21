<script setup lang="ts">
import { ArrowRight, MapPinned } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { regionList } from '../mock/destination'
import { withBase } from '../utils/asset'

const router = useRouter()
</script>

<template>
  <section class="relative isolate min-h-[calc(100svh-72px)] overflow-hidden">
    <img
      class="absolute inset-0 h-full w-full object-cover object-center"
      :src="withBase(regionList[0].coverImg)"
      alt="川西高原雪山风光"
      fetchpriority="high"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/35 to-slate-950/70"></div>
    <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent dark:from-night"></div>

    <div class="page-shell relative z-10 flex min-h-[calc(100svh-72px)] items-center py-24">
      <div class="max-w-4xl text-white">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md"
        >
          <MapPinned :size="15" />
          China Hidden Journeys
        </div>
        <h1
          class="max-w-4xl font-display text-4xl font-semibold leading-[1.18] tracking-normal text-balance sm:text-6xl lg:text-7xl"
        >
          山野行
          <span class="mt-2 block text-3xl font-medium text-white/90 sm:text-5xl lg:text-6xl">
            探索国内 3 天山野目的地
          </span>
        </h1>
        <p class="mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
          选择旅行大区，发现区域内景点，拖拽规划属于你的三天短途行程。
        </p>
        <div class="mt-9 flex flex-wrap items-center gap-4">
          <button
            class="focus-ring inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-forest-800 shadow-lift transition duration-300 hover:-translate-y-0.5 hover:bg-forest-50"
            type="button"
            @click="router.push('/regions')"
          >
            开始探索
            <ArrowRight :size="17" />
          </button>
          <span class="text-sm text-white/65">4 大旅行区 · 14 个精选景点 · 3 天行程看板</span>
        </div>
      </div>
    </div>
  </section>
</template>
