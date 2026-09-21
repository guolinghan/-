<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Eye, EyeOff, LogIn, ShieldCheck, UserPlus } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useTravelStore } from '../composables/useTravelStore'
import { regionList } from '../mock/destination'
import { withBase } from '../utils/asset'

const store = useTravelStore()
const route = useRoute()
const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const showPassword = ref(false)
const error = ref('')
const form = reactive({
  username: '',
  password: ''
})

const heroImage = computed(() => withBase(regionList[0].coverImg))

function switchMode(nextMode: 'login' | 'register') {
  mode.value = nextMode
  error.value = ''
}

function submit() {
  error.value = ''
  const username = form.username.trim()

  if (!username || !form.password) {
    error.value = '用户名和密码不能为空'
    return
  }

  if (form.password.length < 6) {
    error.value = '密码至少需要 6 位'
    return
  }

  const result =
    mode.value === 'login'
      ? store.login(username, form.password)
      : store.register(username, form.password)

  if (!result.ok) {
    error.value = result.message
    return
  }

  store.showToast(result.message, 'success')
  const redirect =
    typeof route.query.redirect === 'string' &&
    route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/'
  router.replace(redirect)
}
</script>

<template>
  <main class="min-h-[calc(100svh-72px)]">
    <div class="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
      <section class="relative hidden overflow-hidden lg:block">
        <img
          class="absolute inset-0 h-full w-full object-cover"
          :src="heroImage"
          alt="川西雪山"
        />
        <div class="absolute inset-0 bg-slate-950/45"></div>
        <div class="relative flex h-full flex-col justify-end p-12 text-white">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
            Into the wild
          </p>
          <h1 class="mt-4 max-w-xl font-display text-5xl font-semibold leading-tight">
            把想去的地方，变成一条真正可走的路线
          </h1>
          <p class="mt-5 max-w-lg text-sm leading-7 text-white/75">
            登录后即可收藏景点、保存三天行程，并在不同设备之间保持清晰的旅行计划。
          </p>
        </div>
      </section>

      <section class="flex items-center justify-center px-5 py-14 sm:px-10">
        <div class="w-full max-w-md">
          <p class="section-label">Account</p>
          <h1 class="font-display text-3xl font-semibold sm:text-4xl">
            {{ mode === 'login' ? '登录山野行' : '注册山野行' }}
          </h1>
          <p class="mt-3 text-sm leading-6 text-gray-500 dark:text-slate-400">
            {{ mode === 'login' ? '继续你的三天山野路线。' : '创建账号后即可收藏和规划行程。' }}
          </p>

          <div class="mt-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1 dark:bg-white/[0.06]">
            <button
              class="focus-ring rounded-lg px-4 py-2.5 text-sm font-bold transition"
              :class="
                mode === 'login'
                  ? 'bg-white text-forest-700 shadow-sm dark:bg-white/10 dark:text-white'
                  : 'text-gray-500 dark:text-slate-400'
              "
              type="button"
              @click="switchMode('login')"
            >
              登录
            </button>
            <button
              class="focus-ring rounded-lg px-4 py-2.5 text-sm font-bold transition"
              :class="
                mode === 'register'
                  ? 'bg-white text-forest-700 shadow-sm dark:bg-white/10 dark:text-white'
                  : 'text-gray-500 dark:text-slate-400'
              "
              type="button"
              @click="switchMode('register')"
            >
              注册
            </button>
          </div>

          <form class="mt-6 space-y-5" @submit.prevent="submit">
            <label class="block">
              <span class="mb-2 block text-xs font-semibold text-gray-600 dark:text-slate-300">
                用户名
              </span>
              <input
                v-model="form.username"
                class="field"
                type="text"
                autocomplete="username"
                placeholder="请输入用户名"
              />
            </label>

            <label class="block">
              <span class="mb-2 block text-xs font-semibold text-gray-600 dark:text-slate-300">
                密码
              </span>
              <span class="relative block">
                <input
                  v-model="form.password"
                  class="field pr-12"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="至少 6 位密码"
                />
                <button
                  class="focus-ring absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-gray-400"
                  type="button"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="16" />
                  <Eye v-else :size="16" />
                </button>
              </span>
            </label>

            <p
              v-if="error"
              class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200"
            >
              {{ error }}
            </p>

            <button
              class="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3.5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-700"
              type="submit"
            >
              <LogIn v-if="mode === 'login'" :size="17" />
              <UserPlus v-else :size="17" />
              {{ mode === 'login' ? '登录' : '注册并登录' }}
            </button>
          </form>

          <div class="mt-6 flex items-start gap-3 rounded-2xl border border-forest-200/70 bg-forest-50/80 p-4 dark:border-forest-300/15 dark:bg-forest-900/30">
            <ShieldCheck :size="18" class="mt-0.5 shrink-0 text-forest-700 dark:text-forest-200" />
            <p class="text-xs leading-5 text-forest-800/75 dark:text-forest-100/70">
              演示账号：`traveller` / `123456`。账号仅保存在本机 localStorage，密码为明文模拟数据。
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
