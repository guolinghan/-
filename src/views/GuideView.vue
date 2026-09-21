<script setup lang="ts">
import {
  Backpack,
  CarFront,
  Compass,
  HeartPulse,
  Mountain,
  ShieldCheck
} from 'lucide-vue-next'

const guideSections = [
  {
    title: '高原出行',
    icon: HeartPulse,
    intro: '循序渐进适应海拔，把休息和补水放进每天的固定节奏。',
    items: [
      '抵达首日避免剧烈运动和长时间爬升。',
      '准备防晒、墨镜、润唇膏和薄羽绒服。',
      '出现持续头痛、恶心时应立即下降到低海拔区域。'
    ]
  },
  {
    title: '徒步装备',
    icon: Backpack,
    intro: '轻量、分层、可替换，比携带大量单一用途装备更重要。',
    items: [
      '防滑徒步鞋、登山杖、冲锋衣和备用袜子。',
      '随身携带基础急救包与头灯。',
      '根据天气准备雨衣，避免使用一次性薄雨披。'
    ]
  },
  {
    title: '自驾须知',
    icon: CarFront,
    intro: '山路行程应留出比平原更多的机动时间。',
    items: [
      '出发前检查刹车、轮胎、玻璃水和备胎。',
      '连续驾驶不超过 2 小时，夜间避免陌生山路。',
      '遇到落石、积水或野生动物时减速停车观察。'
    ]
  },
  {
    title: '行李打包贴士',
    icon: ShieldCheck,
    intro: '按“证件、衣物、电子设备、药品、补给”五类清单逐项确认。',
    items: [
      '充电宝、数据线与离线地图提前准备。',
      '液体和药品使用密封袋单独收纳。',
      '回程预留收纳空间，不要把背包塞得过满。'
    ]
  }
]
</script>

<template>
  <main class="page-shell py-14 sm:py-20">
    <div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <p class="section-label">Travel Guide</p>
        <h1 class="section-title">旅行通用指南</h1>
        <p class="section-copy">
          高原、徒步、自驾和打包的通用知识库，用于出行前快速检查与准备。
        </p>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <Compass :size="17" class="text-forest-600 dark:text-forest-300" />
        出发前阅读 5 分钟
      </div>
    </div>

    <div class="mt-10 grid gap-6 lg:grid-cols-2">
      <article
        v-for="section in guideSections"
        :key="section.title"
        class="rounded-3xl border border-gray-200 bg-white p-7 shadow-soft dark:border-white/10 dark:bg-white/[0.05]"
      >
        <span class="grid h-12 w-12 place-items-center rounded-full bg-forest-50 text-forest-700 dark:bg-forest-900/60 dark:text-forest-200">
          <component :is="section.icon" :size="22" />
        </span>
        <h2 class="mt-5 font-display text-2xl font-semibold">{{ section.title }}</h2>
        <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
          {{ section.intro }}
        </p>
        <ul class="mt-5 space-y-3 border-t border-gray-100 pt-5 dark:border-white/10">
          <li
            v-for="item in section.items"
            :key="item"
            class="flex gap-3 text-sm leading-6 text-gray-600 dark:text-slate-300"
          >
            <Mountain :size="15" class="mt-1 shrink-0 text-forest-600 dark:text-forest-300" />
            {{ item }}
          </li>
        </ul>
      </article>
    </div>
  </main>
</template>
