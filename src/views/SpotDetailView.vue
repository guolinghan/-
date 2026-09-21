<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Mountain,
  Plus,
  ShieldCheck,
  Users
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import SimpleRegionMap from '../components/SimpleRegionMap.vue'
import SpotCard from '../components/SpotCard.vue'
import { useTravelStore } from '../composables/useTravelStore'
import {
  getRegionBySpotId,
  getSpotById,
  regionList
} from '../mock/destination'
import type { Spot } from '../types/travel'
import { withBase } from '../utils/asset'
import { formatDuration } from '../utils/trip'

const route = useRoute()
const router = useRouter()
const store = useTravelStore()

const spot = computed(() => getSpotById(String(route.params.id)))
const region = computed(() =>
  spot.value ? getRegionBySpotId(spot.value.id) : undefined
)
const recommendations = computed(() =>
  region.value
    ? region.value.spots.filter((item) => item.id !== spot.value?.id).slice(0, 3)
    : []
)

function ensureLogin(message: string) {
  if (store.requireLogin(message)) return true
  router.push({
    name: 'login',
    query: {
      redirect: route.fullPath
    }
  })
  return false
}

function toggleSpotFavorite(target: Spot) {
  if (!ensureLogin('收藏景点前请先登录')) return
  store.toggleFavorite(target.id)
}

function addSpotToTrip(target: Spot) {
  if (!ensureLogin('添加行程前请先登录')) return

  const added = store.addSpotToTrip(target)
  if (added) {
    router.push({
      name: 'planner',
      query: {
        tripId: store.currentTrip.value?.id
      }
    })
  }
}

function openRecommendation(recommendedSpot: Spot) {
  router.push({
    name: 'spot-detail',
    params: {
      id: recommendedSpot.id
    }
  })
}

function addTipToTrip(tip: string) {
  if (!spot.value) return
  store.appendTipToTrip(spot.value.id, tip)
}
</script>

<template>
  <main v-if="spot && region">
    <section class="relative min-h-[68svh] overflow-hidden">
      <img
        class="absolute inset-0 h-full w-full object-cover"
        :src="withBase(spot.coverImg)"
        :alt="spot.name"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/35"></div>
      <div class="page-shell relative z-10 flex min-h-[68svh] flex-col justify-end pb-12 pt-32 text-white sm:pb-16">
        <RouterLink
          class="mb-6 inline-flex w-fit items-center gap-2 text-sm text-white/70 transition hover:text-white"
          to="/regions"
        >
          <MapPin :size="15" />
          {{ region.name }}
        </RouterLink>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in spot.typeTags"
            :key="tag"
            class="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md"
          >
            {{ tag }}
          </span>
        </div>
        <h1 class="mt-5 font-display text-4xl font-semibold sm:text-6xl">
          {{ spot.name }}
        </h1>
        <div class="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/75">
            <span class="flex items-center gap-2">
              <CalendarDays :size="16" />
              最佳季节 {{ spot.bestSeason }}
            </span>
            <span class="flex items-center gap-2">
              <Clock3 :size="16" />
              推荐游玩 {{ formatDuration(spot.recommendDuration) }}
            </span>
            <span class="flex items-center gap-2">
              <Mountain :size="16" />
              海拔 {{ spot.altitude }}
            </span>
            <span class="flex items-center gap-2">
              <MapPin :size="16" />
              {{ spot.location.address }}
            </span>
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              class="focus-ring inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              type="button"
              @click="toggleSpotFavorite(spot)"
            >
              <Heart
                :size="17"
                :fill="store.isFavorite(spot.id) ? 'currentColor' : 'none'"
                :class="{ 'text-rose-400': store.isFavorite(spot.id) }"
              />
              {{ store.isFavorite(spot.id) ? '已收藏' : '收藏景点' }}
            </button>
            <button
              class="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-50"
              type="button"
              @click="addSpotToTrip(spot)"
            >
              <Plus :size="17" />
              加入行程
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell py-14 sm:py-20">
      <div class="grid gap-6 lg:grid-cols-3">
        <article class="glass-panel rounded-2xl p-6">
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">门票</p>
          <p class="mt-2 font-display text-2xl font-semibold text-forest-700 dark:text-forest-200">
            {{ spot.price === 0 ? '免费' : `¥${spot.price}` }}
          </p>
        </article>
        <article class="glass-panel rounded-2xl p-6">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Users :size="15" />
            适合人群
          </div>
          <p class="mt-2 text-sm font-semibold leading-6">{{ spot.suitablePeople }}</p>
        </article>
        <article class="glass-panel rounded-2xl p-6">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <ShieldCheck :size="15" />
            出行提示
          </div>
          <p class="mt-2 text-sm font-semibold leading-6">提前查看天气与景区开放情况</p>
        </article>
      </div>

      <div class="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <article class="rounded-3xl border border-gray-200 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
          <p class="section-label">About</p>
          <h2 class="font-display text-2xl font-semibold">景点简介</h2>
          <p class="mt-5 text-sm leading-8 text-gray-600 dark:text-slate-400">
            {{ spot.intro }}
          </p>
        </article>
        <article class="rounded-3xl border border-forest-200/70 bg-forest-50/75 p-7 dark:border-forest-300/15 dark:bg-forest-900/35">
          <p class="section-label">Travel Tips</p>
          <h2 class="font-display text-2xl font-semibold">游玩小贴士</h2>
          <ul class="mt-5 space-y-3">
            <li
              v-for="tip in spot.tips"
              :key="tip"
              class="flex items-start justify-between gap-3 text-sm leading-6 text-forest-900/75 dark:text-forest-100/75"
            >
              <span>{{ tip }}</span>
              <button
                class="focus-ring shrink-0 rounded-full border border-forest-300/60 px-3 py-1 text-[10px] font-bold text-forest-700 transition hover:bg-forest-100 dark:border-forest-300/20 dark:text-forest-200 dark:hover:bg-forest-300/10"
                type="button"
                @click="addTipToTrip(tip)"
              >
                加入备注
              </button>
            </li>
          </ul>
        </article>
      </div>

      <section class="mt-10">
        <div class="mb-5">
          <p class="section-label">Location</p>
          <h2 class="font-display text-2xl font-semibold">景点位置示意</h2>
          <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">
            {{ spot.location.address }} · 经纬度 {{ spot.location.lng }},
            {{ spot.location.lat }}
          </p>
        </div>
        <SimpleRegionMap
          :spots="region.spots"
          :highlight-id="spot.id"
          @select="openRecommendation"
        />
      </section>
    </section>

    <section v-if="recommendations.length" class="page-shell pb-20 sm:pb-24">
      <div class="mb-8">
        <p class="section-label">Nearby</p>
        <h2 class="section-title">同大区推荐</h2>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <SpotCard
          v-for="item in recommendations"
          :key="item.id"
          :spot="item"
          :region="region"
          :favorite="store.isFavorite(item.id)"
          :planned="store.isSpotPlanned(item.id)"
          @open="openRecommendation"
          @favorite="toggleSpotFavorite"
          @add="addSpotToTrip"
        />
      </div>
    </section>
  </main>

  <main v-else class="page-shell py-24 text-center">
    <p class="font-display text-3xl font-semibold">没有找到这个景点</p>
    <RouterLink class="mt-4 inline-block text-sm font-bold text-forest-700" to="/regions">
      返回目的地列表
    </RouterLink>
  </main>
</template>
