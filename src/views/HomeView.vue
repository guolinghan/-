<script setup lang="ts">
import { ArrowRight, Compass, Mountain, Route } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import RegionGrid from '../components/RegionGrid.vue'
import { useTravelStore } from '../composables/useTravelStore'
import { regionList } from '../mock/destination'

const store = useTravelStore()
const router = useRouter()

function selectRegion(regionId: string) {
  store.requestRegionChange(regionId)
  router.push({
    name: 'planner',
    query: {
      regionId
    }
  })
}
</script>

<template>
  <main>
    <HeroSection />

    <section class="page-shell py-20 sm:py-24">
      <div class="mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p class="section-label">Travel Regions</p>
          <h2 class="section-title">选择一片山野，开始三天短途旅行</h2>
          <p class="section-copy">
            4 个国内山野旅行大区，每个区域都有独立景点素材。选定后，整套行程只围绕当前大区展开。
          </p>
        </div>
        <RouterLink
          class="focus-ring inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-forest-300 hover:text-forest-700 dark:border-white/10 dark:text-slate-300"
          to="/regions"
        >
          浏览全部景点
          <ArrowRight :size="16" />
        </RouterLink>
      </div>

      <RegionGrid
        :regions="regionList"
        :current-region-id="store.currentRegionId.value"
        @select="selectRegion"
      />
    </section>

    <section class="page-shell pb-20 sm:pb-24">
      <div class="grid gap-6 md:grid-cols-3">
        <article class="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <Compass :size="22" class="text-forest-600 dark:text-forest-300" />
          <h3 class="mt-4 font-display text-xl font-semibold">选择旅行大区</h3>
          <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
            先确定川西、桂北、郴州或浙西，确保整条路线风格统一。
          </p>
        </article>
        <article class="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <Mountain :size="22" class="text-forest-600 dark:text-forest-300" />
          <h3 class="mt-4 font-display text-xl font-semibold">拖拽安排景点</h3>
          <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
            将区域内景点拖入 Day1 至 Day3，每天最多安排四个。
          </p>
        </article>
        <article class="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <Route :size="22" class="text-forest-600 dark:text-forest-300" />
          <h3 class="mt-4 font-display text-xl font-semibold">保存与回顾</h3>
          <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
            行程自动保存，可随时查看三天时间轴并复制导出行程文本。
          </p>
        </article>
      </div>
    </section>
  </main>
</template>
