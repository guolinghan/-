import { createRouter, createWebHashHistory } from 'vue-router'
import { useTravelStore } from '../composables/useTravelStore'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/regions',
      name: 'regions',
      component: () => import('../views/RegionView.vue')
    },
    {
      path: '/planner',
      name: 'planner',
      component: () => import('../views/PlannerView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/spot/:id',
      name: 'spot-detail',
      component: () => import('../views/SpotDetailView.vue')
    },
    {
      path: '/my-trip',
      name: 'my-trip',
      component: () => import('../views/MyTripView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/my-trip/:tripId',
      name: 'trip-detail',
      component: () => import('../views/TripDetailView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/guide',
      name: 'guide',
      component: () => import('../views/GuideView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return {
      top: 0,
      behavior: 'smooth'
    }
  }
})

router.beforeEach((to) => {
  const store = useTravelStore()

  if (to.meta.requiresAuth && !store.currentUser.value) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.name === 'login' && store.currentUser.value) {
    return {
      name: 'profile'
    }
  }

  return true
})

export default router
