<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlannerBoard from '../components/PlannerBoard.vue'
import { useTravelStore } from '../composables/useTravelStore'

const route = useRoute()
const router = useRouter()
const store = useTravelStore()

function openTripFromQuery() {
  const tripId = typeof route.query.tripId === 'string' ? route.query.tripId : ''
  if (!tripId) return

  const opened = store.openTrip(tripId)
  if (!opened) {
    store.showToast('没有找到对应行程', 'warning')
    router.replace({ name: 'planner' })
  }
}

onMounted(openTripFromQuery)
watch(() => route.query.tripId, openTripFromQuery)
</script>

<template>
  <main>
    <PlannerBoard />
  </main>
</template>
