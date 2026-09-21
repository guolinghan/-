<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Backpack,
  Check,
  Heart,
  LogOut,
  Plus,
  Save,
  Settings2,
  Trash2,
  UserRound
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import SpotCard from '../components/SpotCard.vue'
import { useTravelStore } from '../composables/useTravelStore'
import { getRegionBySpotId } from '../mock/destination'
import type { Spot } from '../types/travel'
import { withBase } from '../utils/asset'

const store = useTravelStore()
const route = useRoute()
const router = useRouter()
const nickname = ref(store.currentUser.value?.nickname ?? '')
const packingForm = ref('')
const packingCategory = ref<'高原' | '徒步' | '通用'>('通用')

const activeTab = computed(() =>
  route.query.tab === 'settings'
    ? 'settings'
    : route.query.tab === 'packing'
      ? 'packing'
      : 'favorites'
)

watch(
  () => store.currentUser.value?.nickname,
  (value) => {
    nickname.value = value ?? ''
  }
)

function setTab(tab: 'favorites' | 'settings' | 'packing') {
  router.replace({
    name: 'profile',
    query: {
      tab
    }
  })
}

function addPacking() {
  if (store.addPackingItem(packingForm.value, packingCategory.value)) {
    packingForm.value = ''
  }
}

function saveNickname() {
  store.updateNickname(nickname.value)
}

function logout() {
  store.logout()
  router.push('/')
}

function clearData() {
  const confirmed = window.confirm('确定清除本机保存的账号、行程、收藏和主题数据吗？')
  if (!confirmed) return

  store.clearAllData()
  router.push('/')
}

function openSpot(spot: Spot) {
  router.push({
    name: 'spot-detail',
    params: {
      id: spot.id
    }
  })
}

function toggleFavorite(spot: Spot) {
  store.toggleFavorite(spot.id)
}

function addSpot(spot: Spot) {
  const added = store.addSpotToTrip(spot)
  if (added) router.push({ name: 'planner' })
}
</script>

<template>
  <main class="page-shell py-14 sm:py-20">
    <section class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
      <div class="relative h-40 overflow-hidden bg-forest-700">
        <img
          class="h-full w-full object-cover opacity-45"
          :src="withBase(store.currentUser.value?.avatar)"
          alt="个人中心背景"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-forest-900/80 to-forest-700/30"></div>
      </div>
      <div class="relative px-6 pb-7 sm:px-8">
        <div class="-mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex items-end gap-4">
            <img
              class="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-soft dark:border-[#1c2926]"
              :src="withBase(store.currentUser.value?.avatar)"
              alt="用户头像"
            />
            <div class="pb-1">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                Shanye Xing Member
              </p>
              <h1 class="mt-1 font-display text-3xl font-semibold">
                {{ store.currentUser.value?.nickname }}
              </h1>
              <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
                收藏 {{ store.favoriteCount.value }} 个景点 · {{ store.trips.value.length }} 条行程
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="mt-8 flex gap-2 rounded-2xl bg-gray-100 p-1.5 dark:bg-white/[0.06] sm:w-fit">
      <button
        class="focus-ring inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition"
        :class="
          activeTab === 'favorites'
            ? 'bg-white text-forest-700 shadow-sm dark:bg-white/10 dark:text-white'
            : 'text-gray-500 dark:text-slate-400'
        "
        type="button"
        @click="setTab('favorites')"
      >
        <Heart :size="16" />
        我的收藏景点
      </button>
      <button
        class="focus-ring inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition"
        :class="
          activeTab === 'settings'
            ? 'bg-white text-forest-700 shadow-sm dark:bg-white/10 dark:text-white'
            : 'text-gray-500 dark:text-slate-400'
        "
        type="button"
        @click="setTab('settings')"
      >
        <Settings2 :size="16" />
        设置
      </button>
      <button
        class="focus-ring inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition"
        :class="
          activeTab === 'packing'
            ? 'bg-white text-forest-700 shadow-sm dark:bg-white/10 dark:text-white'
            : 'text-gray-500 dark:text-slate-400'
        "
        type="button"
        @click="setTab('packing')"
      >
        <Backpack :size="16" />
        出行装备清单
      </button>
    </div>

    <section v-if="activeTab === 'favorites'" class="mt-8">
      <div v-if="store.favoriteSpots.value.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <SpotCard
          v-for="spot in store.favoriteSpots.value"
          :key="spot.id"
          :spot="spot"
          :region="getRegionBySpotId(spot.id)"
          favorite
          :planned="store.isSpotPlanned(spot.id)"
          @open="openSpot"
          @favorite="toggleFavorite"
          @add="addSpot"
        />
      </div>
      <div
        v-else
        class="rounded-3xl border border-dashed border-gray-300 bg-white/60 px-6 py-20 text-center dark:border-white/15 dark:bg-white/[0.03]"
      >
        <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-300/10">
          <Heart :size="23" />
        </span>
        <h2 class="mt-5 font-display text-2xl font-semibold">收藏夹还是空的</h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">
          在景点详情或目的地列表点击爱心即可收藏。
        </p>
        <RouterLink
          class="mt-6 inline-block rounded-full bg-forest-600 px-6 py-3 text-sm font-bold text-white"
          to="/regions"
        >
          浏览景点
        </RouterLink>
      </div>
    </section>

    <section v-else-if="activeTab === 'settings'" class="mt-8 grid gap-6 lg:grid-cols-2">
      <article class="rounded-3xl border border-gray-200 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div class="flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-full bg-forest-50 text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
            <UserRound :size="20" />
          </span>
          <div>
            <h2 class="font-display text-xl font-semibold">个人资料</h2>
            <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">修改昵称会同步保存到 localStorage</p>
          </div>
        </div>

        <label class="mt-6 block">
          <span class="mb-2 block text-xs font-semibold text-gray-600 dark:text-slate-300">
            昵称
          </span>
          <input v-model="nickname" class="field" type="text" maxlength="20" />
        </label>

        <button
          class="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-forest-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-700"
          type="button"
          @click="saveNickname"
        >
          <Save :size="16" />
          保存昵称
        </button>
      </article>

      <article class="rounded-3xl border border-gray-200 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <h2 class="font-display text-xl font-semibold">账号与数据</h2>
        <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
          退出当前账号，或清除本机保存的全部演示数据。
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            class="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:text-slate-300"
            type="button"
            @click="logout"
          >
            <LogOut :size="16" />
            退出登录
          </button>
          <button
            class="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-5 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-300/20 dark:hover:bg-rose-300/10"
            type="button"
            @click="clearData"
          >
            <Trash2 :size="16" />
            清除本地数据
          </button>
        </div>
      </article>
    </section>

    <section v-else class="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <article class="rounded-3xl border border-gray-200 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-xl font-semibold">装备 Todo 清单</h2>
            <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
              已完成 {{ store.currentUser.value?.packingList.filter((item) => item.done).length || 0 }}
              / {{ store.currentUser.value?.packingList.length || 0 }}
            </p>
          </div>
          <Backpack :size="24" class="text-forest-600 dark:text-forest-300" />
        </div>

        <div v-if="store.currentUser.value?.packingList.length" class="mt-6 space-y-2">
          <div
            v-for="item in store.currentUser.value.packingList"
            :key="item.id"
            class="flex items-center gap-3 rounded-xl border border-gray-200 bg-canvas/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.035]"
          >
            <button
              class="focus-ring grid h-6 w-6 shrink-0 place-items-center rounded-full border transition"
              :class="
                item.done
                  ? 'border-forest-600 bg-forest-600 text-white'
                  : 'border-gray-300 text-transparent dark:border-white/20'
              "
              type="button"
              :aria-label="item.done ? '标记未完成' : '标记完成'"
              @click="store.togglePackingItem(item.id)"
            >
              <Check :size="12" />
            </button>
            <span class="flex-1 text-sm" :class="{ 'line-through opacity-55': item.done }">
              {{ item.label }}
            </span>
            <span class="rounded-full bg-forest-50 px-2.5 py-1 text-[9px] font-bold text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
              {{ item.category }}
            </span>
            <button
              class="focus-ring grid h-7 w-7 place-items-center rounded-full text-gray-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-300/10"
              type="button"
              aria-label="删除装备"
              @click="store.removePackingItem(item.id)"
            >
              <Trash2 :size="13" />
            </button>
          </div>
        </div>
        <p v-else class="mt-8 rounded-2xl border border-dashed border-gray-300 px-5 py-12 text-center text-sm text-gray-400 dark:border-white/15">
          清单还是空的，应用模板或手动添加装备。
        </p>
      </article>

      <article class="rounded-3xl border border-gray-200 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <h2 class="font-display text-xl font-semibold">添加装备</h2>
        <div class="mt-5 space-y-3">
          <input
            v-model="packingForm"
            class="field"
            type="text"
            placeholder="例如：登山杖"
            @keyup.enter="addPacking"
          />
          <select v-model="packingCategory" class="field">
            <option value="高原">高原</option>
            <option value="徒步">徒步</option>
            <option value="通用">通用</option>
          </select>
          <button
            class="focus-ring flex w-full items-center justify-center gap-2 rounded-full bg-forest-600 px-5 py-3 text-sm font-bold text-white"
            type="button"
            @click="addPacking"
          >
            <Plus :size="16" />
            添加到清单
          </button>
        </div>

        <div class="mt-6 space-y-3 border-t border-gray-100 pt-6 dark:border-white/10">
          <p class="text-xs font-bold text-gray-500 dark:text-slate-400">快速模板</p>
          <button
            class="focus-ring w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-bold text-forest-700 dark:border-forest-300/20 dark:bg-forest-900/40 dark:text-forest-100"
            type="button"
            @click="store.applyPackingTemplate('altitude')"
          >
            应用高原模板
          </button>
          <button
            class="focus-ring w-full rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-bold text-forest-700 dark:border-forest-300/20 dark:bg-forest-900/40 dark:text-forest-100"
            type="button"
            @click="store.applyPackingTemplate('hiking')"
          >
            应用徒步模板
          </button>
        </div>
      </article>
    </section>
  </main>
</template>
