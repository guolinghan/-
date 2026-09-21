<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Compass,
  Heart,
  LogIn,
  Menu,
  Moon,
  Route,
  Sun,
  UserRound,
  X
} from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useTravelStore } from '../composables/useTravelStore'
import { withBase } from '../utils/asset'

const store = useTravelStore()
const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)

const isDark = computed(() => store.theme.value === 'dark')
const isLoggedIn = computed(() => Boolean(store.currentUser.value))

const menuItems = [
  {
    label: '目的地',
    to: '/regions'
  },
  {
    label: '我的行程',
    to: '/my-trip'
  },
  {
    label: '出行指南',
    to: '/guide'
  }
]

function isActive(path: string) {
  if (path === '/regions') {
    return route.path === '/regions' || route.path.startsWith('/spot/')
  }
  return route.path.startsWith(path)
}

function openLogin() {
  mobileOpen.value = false
  router.push({
    name: 'login',
    query: {
      redirect: route.fullPath
    }
  })
}

function openFavorites() {
  mobileOpen.value = false
  router.push({
    name: 'profile',
    query: {
      tab: 'favorites'
    }
  })
}

watch(mobileOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-gray-200/70 bg-canvas/85 backdrop-blur-xl transition-colors duration-500 dark:border-white/10 dark:bg-night/80"
  >
    <nav class="page-shell flex h-[72px] items-center justify-between gap-4">
      <RouterLink
        class="focus-ring flex items-center gap-2.5 rounded-lg text-left"
        to="/"
      >
        <span
          class="grid h-10 w-10 place-items-center rounded-full bg-forest-600 text-white shadow-soft"
        >
          <Compass :size="21" :stroke-width="1.8" />
        </span>
        <span>
          <span class="block font-display text-xl font-semibold tracking-[0.12em]">
            山野行
          </span>
          <span
            class="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500 sm:block dark:text-slate-400"
          >
            Into the wild
          </span>
        </span>
      </RouterLink>

      <div class="hidden items-center gap-1 lg:flex">
        <RouterLink
          v-for="item in menuItems"
          :key="item.to"
          class="focus-ring rounded-lg px-4 py-2 text-sm font-medium transition"
          :class="
            isActive(item.to)
              ? 'bg-forest-50 text-forest-700 dark:bg-white/[0.08] dark:text-white'
              : 'text-gray-600 hover:bg-forest-50 hover:text-forest-700 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
          "
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
        <button
          class="focus-ring relative rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-forest-50 hover:text-forest-700 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
          type="button"
          @click="openFavorites"
        >
          我的收藏
          <span
            v-if="store.favoriteCount.value"
            class="ml-1.5 rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-bold text-forest-700 dark:bg-forest-800 dark:text-forest-100"
          >
            {{ store.favoriteCount.value }}
          </span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="focus-ring grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-forest-300 hover:text-forest-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-forest-300/50"
          type="button"
          :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
          @click="store.toggleTheme"
        >
          <Sun v-if="isDark" :size="18" />
          <Moon v-else :size="18" />
        </button>

        <RouterLink
          v-if="isLoggedIn"
          class="focus-ring hidden items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 sm:flex dark:border-white/10 dark:bg-white/[0.06]"
          to="/profile"
        >
          <img
            class="h-8 w-8 rounded-full object-cover"
            :src="withBase(store.currentUser.value?.avatar)"
            alt="用户头像"
          />
          <span class="max-w-24 truncate text-sm font-semibold text-ink dark:text-white">
            {{ store.currentUser.value?.nickname }}
          </span>
        </RouterLink>

        <button
          v-else
          class="focus-ring hidden items-center gap-2 rounded-full bg-forest-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-700 sm:inline-flex"
          type="button"
          @click="openLogin"
        >
          <LogIn :size="16" />
          登录
        </button>

        <button
          class="focus-ring grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 lg:hidden dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
          type="button"
          :aria-label="mobileOpen ? '关闭菜单' : '打开菜单'"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>
    </nav>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="absolute left-0 right-0 top-[72px] border-b border-gray-200 bg-canvas px-5 pb-6 pt-3 shadow-soft lg:hidden dark:border-white/10 dark:bg-night"
      >
        <div class="flex flex-col">
          <RouterLink
            v-for="item in menuItems"
            :key="item.to"
            class="flex items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium hover:bg-forest-50 dark:hover:bg-white/[0.06]"
            :to="item.to"
            @click="mobileOpen = false"
          >
            {{ item.label }}
            <Route :size="17" />
          </RouterLink>
          <button
            class="flex items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium hover:bg-forest-50 dark:hover:bg-white/[0.06]"
            type="button"
            @click="openFavorites"
          >
            <span class="flex items-center gap-2">
              <Heart :size="17" />
              我的收藏
            </span>
            <span v-if="store.favoriteCount.value">{{ store.favoriteCount.value }}</span>
          </button>
          <RouterLink
            v-if="isLoggedIn"
            class="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-base font-medium hover:bg-forest-50 dark:hover:bg-white/[0.06]"
            to="/profile"
            @click="mobileOpen = false"
          >
            <UserRound :size="17" />
            个人中心
          </RouterLink>
          <button
            v-else
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 px-4 py-3 text-sm font-semibold text-white"
            type="button"
            @click="openLogin"
          >
            <LogIn :size="16" />
            登录 / 注册
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>
