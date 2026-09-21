import { computed, ref, watch } from 'vue'
import {
  destinationList,
  getRegionById,
  getSpotById,
  mockUser,
  regionList
} from '../mock/destination'
import type {
  CustomStopType,
  CustomSourceItem,
  CustomTripStop,
  DayKey,
  PackingItem,
  RouteOptimizationPreview,
  Spot,
  SpotTripStop,
  StoredUser,
  ToastState,
  Trip,
  TripBudget,
  TripDays,
  TripStop,
  TimeSlot
} from '../types/travel'
import {
  allocateOptimizedSpots,
  calculateDaySchedule,
  calculateSpotRouteDistance,
  formatDuration,
  getStopDurationMinutes,
  optimizeSpotsByLocation,
  optimizeSpotOrder,
  timeSlots
} from '../utils/trip'

const STORAGE_PREFIX = 'shanyexing_'

export const STORAGE_KEYS = {
  theme: `${STORAGE_PREFIX}theme`,
  users: `${STORAGE_PREFIX}users_demo`,
  session: `${STORAGE_PREFIX}session`,
  favorites: `${STORAGE_PREFIX}favorites`,
  trips: `${STORAGE_PREFIX}trips`,
  activeTrip: `${STORAGE_PREFIX}active_trip`,
  currentRegion: `${STORAGE_PREFIX}current_region`
} as const

const dayKeys: DayKey[] = ['Day1', 'Day2', 'Day3']

function getDayStops(trip: Trip, day: DayKey) {
  return timeSlots.flatMap((slot) => trip.days[day][slot])
}

function getDaySpotStops(trip: Trip, day: DayKey) {
  return getDayStops(trip, day).filter((stop) => stop.kind === 'spot')
}

function getTripStops(trip: Trip) {
  return dayKeys.flatMap((day) => getDayStops(trip, day))
}

function emptyDays(): TripDays {
  return {
    Day1: {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    },
    Day2: {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    },
    Day3: {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    }
  }
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch (error) {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // localStorage 不可用时，页面仍能使用，只是无法持久化。
  }
}

function createPlanId(spotId: string) {
  return `${spotId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createTripId() {
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createCustomPlanId(type: CustomStopType) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeTripStop(
  stop: Partial<TripStop> & {
    spot?: Spot
  },
  index: number,
  dayIndex: number
): TripStop | null {
  const fallbackSlot = timeSlots[Math.min(index, timeSlots.length - 1)]

  if (stop.kind === 'custom' && 'customType' in stop) {
    const customStop = stop as Partial<CustomTripStop> & {
      durationMinutes?: number
    }
    const duration =
      customStop.userDuration ??
      customStop.durationMinutes ??
      customStop.recommendDuration ??
      60
    const planId =
      customStop.planId ?? createCustomPlanId(customStop.customType!)
    return {
      kind: 'custom',
      type: 'custom',
      id: planId,
      planId,
      slot: customStop.slot ?? fallbackSlot,
      period: customStop.period ?? customStop.slot ?? fallbackSlot,
      dayIndex,
      customType: customStop.customType!,
      title: customStop.title ?? '自定义安排',
      recommendDuration: customStop.recommendDuration ?? duration,
      userDuration: duration,
      startTime: customStop.startTime,
      endTime: customStop.endTime,
      driveToNext: customStop.driveToNext ?? 0,
      remark: customStop.remark ?? '',
      isDone: customStop.isDone ?? false
    }
  }

  const savedSpot = stop.spot
  if (!savedSpot) return null
  const spot =
    getSpotById(savedSpot.id) ??
    destinationList.find((item) => item.name === savedSpot.name)
  if (!spot) return null

  const planId = stop.planId ?? createPlanId(spot.id)
  return {
    kind: 'spot',
    type: 'spot',
    id: planId,
    planId,
    slot: stop.slot ?? fallbackSlot,
    period: stop.period ?? stop.slot ?? fallbackSlot,
    dayIndex,
    title: spot.name,
    recommendDuration: spot.recommendDuration,
    userDuration:
      stop.userDuration ?? stop.recommendDuration ?? spot.recommendDuration,
    startTime: stop.startTime,
    endTime: stop.endTime,
    driveToNext: stop.driveToNext ?? 0,
    remark: stop.remark ?? '',
    isDone: stop.isDone ?? false,
    spot,
    spotId: spot.id,
    spotTags: spot.typeTags,
    spotTips: spot.tips,
    price: spot.price
  }
}

function normalizeTrip(trip: Trip): Trip {
  const normalizedDays = emptyDays()

  dayKeys.forEach((day, dayIndex) => {
    const source = trip.days?.[day]
    const flatStops = Array.isArray(source)
      ? source
      : timeSlots.flatMap((slot) => source?.[slot] ?? [])
    const normalizedStops = flatStops
      .map((stop, index) => normalizeTripStop(stop, index, dayIndex))
      .filter((stop): stop is TripStop => Boolean(stop))

  timeSlots.forEach((slot) => {
      normalizedDays[day][slot] = normalizedStops.filter(
        (stop) => stop.slot === slot
      )
    })
  })
  return {
    ...trip,
    days: normalizedDays,
    dayNotes: {
      Day1: trip.dayNotes?.Day1 ?? '',
      Day2: trip.dayNotes?.Day2 ?? '',
      Day3: trip.dayNotes?.Day3 ?? ''
    },
    foodLodging: Number(trip.foodLodging || 0)
  }
}

function createDefaultUsers(): StoredUser[] {
  return [
    {
      username: 'traveller',
      password: '123456',
      profile: JSON.parse(JSON.stringify(mockUser))
    }
  ]
}

const theme = ref<'light' | 'dark'>(
  readStorage(STORAGE_KEYS.theme, 'light')
)
const users = ref<StoredUser[]>(readStorage(STORAGE_KEYS.users, createDefaultUsers()))
const session = ref<{ username: string } | null>(
  readStorage(STORAGE_KEYS.session, null)
)
const currentUser = ref<StoredUser['profile'] | null>(null)
const favoritesByUser = ref<Record<string, string[]>>(
  readStorage(STORAGE_KEYS.favorites, {})
)
const tripsByUser = ref<Record<string, Trip[]>>(
  readStorage(STORAGE_KEYS.trips, {})
)
const activeTripIds = ref<Record<string, string | null>>(
  readStorage(STORAGE_KEYS.activeTrip, {})
)
const currentRegionId = ref<string | null>(
  readStorage(STORAGE_KEYS.currentRegion, null)
)

const favorites = ref<string[]>([])
const trips = ref<Trip[]>([])
const activeTripId = ref<string | null>(null)
const regionSwitchOpen = ref(false)
const pendingRegionId = ref<string | null>(null)
const routeOptimizationOpen = ref(false)
const routeOptimizationPreview = ref<RouteOptimizationPreview | null>(null)
const pendingOptimizedOrder = ref<SpotTripStop[]>([])
const toast = ref<ToastState>({
  visible: false,
  message: '',
  type: 'info'
})

let toastTimer: number | undefined
let pendingRegionAction: (() => void) | null = null

const currentRegion = computed(() =>
  currentRegionId.value ? getRegionById(currentRegionId.value) : undefined
)

const currentRegionSpots = computed(() => currentRegion.value?.spots ?? [])

const currentTrip = computed(
  () => trips.value.find((trip) => trip.id === activeTripId.value) ?? null
)

const favoriteSpots = computed(() =>
  favorites.value
    .map((spotId) => destinationList.find((spot) => spot.id === spotId))
    .filter((spot): spot is Spot => Boolean(spot))
)

const favoriteCount = computed(() => favorites.value.length)

const customSourceItems = computed(
  () => currentUser.value?.customItems ?? []
)

const currentTripSpotCount = computed(() =>
  currentTrip.value ? getTripStops(currentTrip.value).length : 0
)

const currentTripBudget = computed<TripBudget>(() =>
  calculateTripBudget(currentTrip.value)
)

function calculateTripBudget(trip: Trip | null): TripBudget {
  if (!trip) {
    return {
      tickets: 0,
      foodLodging: 0,
      total: 0
    }
  }

  const tickets = dayKeys.reduce(
    (total, day) =>
      total +
      getDayStops(trip, day).reduce(
        (dayTotal, tripStop) =>
          dayTotal + (tripStop.kind === 'spot' ? tripStop.spot.price : 0),
        0
      ),
    0
  )

  return {
    tickets,
    foodLodging: Number(trip.foodLodging || 0),
    total: tickets + Number(trip.foodLodging || 0)
  }
}

function calculateDayStats(trip: Trip, day: DayKey) {
  const stops = getDayStops(trip, day)
  const schedule = calculateDaySchedule(stops, day)
  const activeMinutes = schedule.length
    ? schedule[schedule.length - 1].endMinutes -
      schedule[0].arrivalMinutes
    : 0

  return {
    activeMinutes,
    crowded: activeMinutes > 10 * 60
  }
}

function syncDarkClass() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
}

function showToast(
  message: string,
  type: ToastState['type'] = 'info'
) {
  toast.value = { visible: true, message, type }
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value.visible = false
  }, 2600)
}

function findCurrentStoredUser() {
  if (!session.value) return undefined
  return users.value.find((user) => user.username === session.value?.username)
}

function persistUsers() {
  writeStorage(STORAGE_KEYS.users, users.value)
}

function persistUserData() {
  const storedUser = findCurrentStoredUser()
  if (!storedUser || !currentUser.value) return

  const username = storedUser.username
  storedUser.profile.favoriteSpotIds = [...favorites.value]
  storedUser.profile.tripList = trips.value.map((trip) => trip.id)
  if (!Array.isArray(storedUser.profile.packingList)) {
    storedUser.profile.packingList = []
  }
  if (!Array.isArray(storedUser.profile.customItems)) {
    storedUser.profile.customItems = []
  }
  currentUser.value = storedUser.profile

  favoritesByUser.value = {
    ...favoritesByUser.value,
    [username]: [...favorites.value]
  }
  tripsByUser.value = {
    ...tripsByUser.value,
    [username]: trips.value
  }
  activeTripIds.value = {
    ...activeTripIds.value,
    [username]: activeTripId.value
  }

  writeStorage(STORAGE_KEYS.favorites, favoritesByUser.value)
  writeStorage(STORAGE_KEYS.trips, tripsByUser.value)
  writeStorage(STORAGE_KEYS.activeTrip, activeTripIds.value)
  persistUsers()
}

function loadUserData() {
  const storedUser = findCurrentStoredUser()

  if (!storedUser) {
    currentUser.value = null
    favorites.value = []
    trips.value = []
    activeTripId.value = null
    return
  }

  currentUser.value = storedUser.profile
  favorites.value = (favoritesByUser.value[storedUser.username] ?? []).filter(
    (spotId) => Boolean(destinationList.find((spot) => spot.id === spotId))
  )
  trips.value = (tripsByUser.value[storedUser.username] ?? []).map(normalizeTrip)
  activeTripId.value =
    activeTripIds.value[storedUser.username] ??
    trips.value[0]?.id ??
    null
}

function requireLogin(message = '请先登录后再继续操作') {
  if (currentUser.value) return true
  showToast(message, 'warning')
  return false
}

function register(username: string, password: string) {
  const name = username.trim()

  if (users.value.some((user) => user.username === name)) {
    return { ok: false, message: '该用户名已注册，请直接登录' }
  }

  // Demo 演示：密码明文保存在 localStorage，生产环境必须使用安全后端与密码哈希。
  const profile: StoredUser['profile'] = {
    id: `u-${Date.now()}`,
    nickname: name,
    avatar: '/assets/region/chuanxi.jpg',
    favoriteSpotIds: [],
    tripList: [],
    packingList: [],
    customItems: []
  }

  users.value = [...users.value, { username: name, password, profile }]
  persistUsers()
  writeStorage(STORAGE_KEYS.session, { username: name })
  session.value = { username: name }
  loadUserData()
  return { ok: true, message: '注册成功，已自动登录' }
}

function login(username: string, password: string) {
  const name = username.trim()
  const matched = users.value.find(
    (user) => user.username === name && user.password === password
  )

  if (!matched) {
    return { ok: false, message: '用户名或密码错误' }
  }

  session.value = { username: matched.username }
  writeStorage(STORAGE_KEYS.session, session.value)
  loadUserData()
  return { ok: true, message: `欢迎回来，${matched.profile.nickname}` }
}

function logout() {
  persistUserData()
  session.value = null
  localStorage.removeItem(STORAGE_KEYS.session)
  loadUserData()
  showToast('已退出登录')
}

function updateNickname(nickname: string) {
  const nextNickname = nickname.trim()
  if (!nextNickname || !currentUser.value) return false

  const storedUser = findCurrentStoredUser()
  if (!storedUser) return false

  storedUser.profile.nickname = nextNickname
  currentUser.value = storedUser.profile
  persistUsers()
  showToast('昵称已更新', 'success')
  return true
}

function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  currentUser.value = null
  session.value = null
  favorites.value = []
  trips.value = []
  activeTripId.value = null
  currentRegionId.value = null
  theme.value = 'light'
  users.value = createDefaultUsers()
  favoritesByUser.value = {}
  tripsByUser.value = {}
  activeTripIds.value = {}
  persistUsers()
  syncDarkClass()
  showToast('本地数据已清除')
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  writeStorage(STORAGE_KEYS.theme, theme.value)
  syncDarkClass()
}

function isFavorite(spotId: string) {
  return favorites.value.includes(spotId)
}

function toggleFavorite(spotId: string) {
  if (!requireLogin('收藏景点前请先登录')) return false

  if (isFavorite(spotId)) {
    favorites.value = favorites.value.filter((id) => id !== spotId)
    showToast('已取消收藏')
  } else {
    favorites.value = [...favorites.value, spotId]
    showToast('已收藏景点', 'success')
  }

  persistUserData()
  return true
}

function createTrip(regionId: string, name?: string) {
  if (!requireLogin('新建行程前请先登录')) return null

  const region = getRegionById(regionId)
  if (!region) return null

  const now = new Date().toISOString()
  const trip: Trip = {
    id: createTripId(),
    name: name?.trim() || `${region.name} 3日行程`,
    regionId: region.id,
    regionName: region.name,
    days: emptyDays(),
    dayNotes: {
      Day1: '',
      Day2: '',
      Day3: ''
    },
    foodLodging: 0,
    createdAt: now,
    updatedAt: now
  }

  trips.value = [...trips.value, trip]
  activeTripId.value = trip.id
  currentRegionId.value = region.id
  writeStorage(STORAGE_KEYS.currentRegion, region.id)
  persistUserData()
  showToast('新行程已创建', 'success')
  return trip
}

function deleteTrip(tripId: string) {
  const target = trips.value.find((trip) => trip.id === tripId)
  if (!target) return

  trips.value = trips.value.filter((trip) => trip.id !== tripId)
  if (activeTripId.value === tripId) {
    activeTripId.value = trips.value[0]?.id ?? null
  }
  persistUserData()
  showToast(`已删除「${target.name}」`)
}

function openTrip(tripId: string) {
  const trip = trips.value.find((item) => item.id === tripId)
  if (!trip) return false

  activeTripId.value = trip.id
  currentRegionId.value = trip.regionId
  writeStorage(STORAGE_KEYS.currentRegion, trip.regionId)
  persistUserData()
  return true
}

function getTripById(tripId: string) {
  return trips.value.find((trip) => trip.id === tripId)
}

function applyRegionChange(regionId: string) {
  const region = getRegionById(regionId)
  if (!region) return

  currentRegionId.value = region.id
  writeStorage(STORAGE_KEYS.currentRegion, region.id)

  if (currentTrip.value) {
    currentTrip.value.regionId = region.id
    currentTrip.value.regionName = region.name
    currentTrip.value.name = `${region.name} 3日行程`
    currentTrip.value.days = emptyDays()
    currentTrip.value.updatedAt = new Date().toISOString()
  }

  persistUserData()
}

function requestRegionChange(
  regionId: string,
  afterChange?: () => void
) {
  if (!getRegionById(regionId)) return false

  if (currentRegionId.value === regionId) {
    afterChange?.()
    return true
  }

  if (currentTripSpotCount.value === 0) {
    applyRegionChange(regionId)
    afterChange?.()
    return true
  }

  pendingRegionId.value = regionId
  pendingRegionAction = afterChange ?? null
  regionSwitchOpen.value = true
  return false
}

function cancelRegionSwitch() {
  regionSwitchOpen.value = false
  pendingRegionId.value = null
  pendingRegionAction = null
}

function confirmRegionSwitch() {
  const targetRegionId = pendingRegionId.value
  const afterChange = pendingRegionAction

  regionSwitchOpen.value = false
  pendingRegionId.value = null
  pendingRegionAction = null

  if (!targetRegionId) return
  applyRegionChange(targetRegionId)
  afterChange?.()
}

function addSpotToTrip(
  spot: Spot,
  preferredDay?: DayKey,
  preferredSlot?: TimeSlot
) {
  if (!requireLogin('添加行程前请先登录')) return false

  const region = regionList.find((item) =>
    item.spots.some((regionSpot) => regionSpot.id === spot.id)
  )
  if (!region) return false

  if (!currentTrip.value) {
    createTrip(region.id)
  }

  if (currentTrip.value?.regionId !== region.id) {
    requestRegionChange(region.id, () =>
      addSpotToTrip(spot, preferredDay, preferredSlot)
    )
    return false
  }

  const trip = currentTrip.value
  if (!trip) return false

  let targetDay =
    preferredDay && getDaySpotStops(trip, preferredDay).length < 4
      ? preferredDay
      : dayKeys.find((day) => getDaySpotStops(trip, day).length < 4)

  if (!targetDay) {
    showToast('Day1、Day2、Day3 均已达到 4 个景点上限', 'warning')
    return false
  }

  const targetSlot =
    preferredSlot ??
    timeSlots[
      Math.min(getDayStops(trip, targetDay).length, timeSlots.length - 1)
    ]
  const planId = createPlanId(spot.id)
  trip.days[targetDay][targetSlot].push({
    kind: 'spot',
    type: 'spot',
    id: planId,
    planId,
    slot: targetSlot,
    period: targetSlot,
    dayIndex: dayKeys.indexOf(targetDay),
    title: spot.name,
    recommendDuration: spot.recommendDuration,
    userDuration: spot.recommendDuration,
    driveToNext: 0,
    remark: '',
    isDone: false,
    spot,
    spotId: spot.id,
    spotTags: spot.typeTags,
    spotTips: spot.tips,
    price: spot.price
  })
  trip.updatedAt = new Date().toISOString()
  persistUserData()
  showToast(`已将 ${spot.name} 加入 ${targetDay}`, 'success')
  return true
}

function removeTripStop(day: DayKey, slot: TimeSlot, index: number) {
  if (!currentTrip.value) return

  const [removed] = currentTrip.value.days[day][slot].splice(index, 1)
  currentTrip.value.updatedAt = new Date().toISOString()
  persistUserData()
  if (removed) {
    const title = removed.kind === 'spot' ? removed.spot.name : removed.title
    showToast(`已从 ${day} 移除 ${title}`)
  }
}

function handlePlannerChange(
  day: DayKey,
  slot: TimeSlot,
  event: Record<string, any>
) {
  if (!currentTrip.value) return

  if (event.added) {
    const tripStop = event.added.element
    tripStop.slot = slot
    tripStop.period = slot
    tripStop.dayIndex = dayKeys.indexOf(day)
    if (!tripStop.planId) {
      tripStop.planId =
        tripStop.kind === 'spot'
          ? createPlanId(tripStop.spot.id)
          : createCustomPlanId(tripStop.customType)
    }
    tripStop.id = tripStop.planId
    const title = tripStop.kind === 'spot' ? tripStop.spot.name : tripStop.title
    showToast(`${title} 已加入 ${day}`, 'success')
  }

  currentTrip.value.updatedAt = new Date().toISOString()
  persistUserData()
}

function createDragClone(spot: Spot): SpotTripStop {
  const planId = createPlanId(spot.id)
  return {
    kind: 'spot',
    type: 'spot',
    id: planId,
    planId,
    slot: 'morning',
    period: 'morning',
    dayIndex: 0,
    title: spot.name,
    recommendDuration: spot.recommendDuration,
    userDuration: spot.recommendDuration,
    driveToNext: 0,
    remark: '',
    isDone: false,
    spot,
    spotId: spot.id,
    spotTags: spot.typeTags,
    spotTips: spot.tips,
    price: spot.price
  }
}

function createCustomDragClone(
  customType: CustomStopType
): CustomTripStop {
  const templates: Record<
    CustomStopType,
    Pick<CustomTripStop, 'title' | 'recommendDuration'>
  > = {
    hotel: {
      title: '酒店入住',
      recommendDuration: 45
    },
    lunch: {
      title: '午餐',
      recommendDuration: 60
    },
    dinner: {
      title: '晚餐',
      recommendDuration: 75
    },
    rest: {
      title: '休息',
      recommendDuration: 60
    }
  }
  const template = templates[customType]
  const planId = createCustomPlanId(customType)

  return {
    kind: 'custom',
    type: 'custom',
    id: planId,
    planId,
    slot: 'morning',
    period: 'morning',
    dayIndex: 0,
    customType,
    title: template.title,
    recommendDuration: template.recommendDuration,
    userDuration: template.recommendDuration,
    driveToNext: 0,
    remark: '',
    isDone: false
  }
}

function addCustomSourceItem(
  title: string,
  userDuration: number,
  preferredDay: DayKey,
  preferredSlot: TimeSlot
) {
  if (!requireLogin('新增自定义条目前请先登录')) return false
  const nextTitle = title.trim()
  if (!nextTitle || !currentUser.value) return false

  const item: CustomSourceItem = {
    id: `custom-source-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: nextTitle,
    recommendDuration: Math.max(1, Number(userDuration) || 60),
    userDuration: Math.max(1, Number(userDuration) || 60),
    preferredDay,
    preferredSlot,
    remark: ''
  }

  currentUser.value.customItems = [
    ...(currentUser.value.customItems ?? []),
    item
  ]
  persistUsers()
  showToast('已生成自定义素材卡片，请拖入行程', 'success')
  return true
}

function removeCustomSourceItem(itemId: string) {
  if (!currentUser.value) return
  currentUser.value.customItems = (currentUser.value.customItems ?? []).filter(
    (item) => item.id !== itemId
  )
  persistUsers()
  showToast('已移除自定义素材卡片')
}

function createUserCustomDragClone(
  item: CustomSourceItem
): CustomTripStop {
  const planId = `custom-${item.id}-${Date.now()}`
  return {
    kind: 'custom',
    type: 'custom',
    id: planId,
    planId,
    slot: item.preferredSlot,
    period: item.preferredSlot,
    dayIndex: dayKeys.indexOf(item.preferredDay),
    customType: 'rest',
    title: item.title,
    recommendDuration: item.recommendDuration,
    userDuration: item.userDuration,
    driveToNext: 0,
    remark: item.remark,
    isDone: false
  }
}

function updateTripItem(
  day: DayKey,
  slot: TimeSlot,
  index: number,
  patch: Partial<TripStop>
) {
  const item = currentTrip.value?.days[day][slot][index]
  if (!item) return

  Object.assign(item, patch)
  item.id = item.planId
  item.period = item.slot
  item.dayIndex = dayKeys.indexOf(day)
  currentTrip.value!.updatedAt = new Date().toISOString()
  persistUserData()
}

function toggleTripItemDone(day: DayKey, slot: TimeSlot, index: number) {
  const item = currentTrip.value?.days[day][slot][index]
  if (!item) return
  item.isDone = !item.isDone
  currentTrip.value!.updatedAt = new Date().toISOString()
  persistUserData()
}

function setTripItemDuration(
  day: DayKey,
  slot: TimeSlot,
  index: number,
  minutes: number
) {
  const item = currentTrip.value?.days[day][slot][index]
  if (!item) return
  item.userDuration = Math.max(1, Number(minutes) || item.recommendDuration)
  currentTrip.value!.updatedAt = new Date().toISOString()
  persistUserData()
}

function setTripItemTime(
  day: DayKey,
  slot: TimeSlot,
  index: number,
  field: 'startTime' | 'endTime',
  value: string
) {
  const item = currentTrip.value?.days[day][slot][index]
  if (!item) return
  item[field] = value || undefined
  currentTrip.value!.updatedAt = new Date().toISOString()
  persistUserData()
}

function setTripItemRemark(
  day: DayKey,
  slot: TimeSlot,
  index: number,
  remark: string
) {
  updateTripItem(day, slot, index, { remark })
}

function duplicateTripItem(day: DayKey, slot: TimeSlot, index: number) {
  const trip = currentTrip.value
  const source = trip?.days[day][slot][index]
  if (!trip || !source) return

  const planId = `${source.planId}-copy-${Date.now()}`
  const copy = {
    ...JSON.parse(JSON.stringify(source)),
    id: planId,
    planId,
    isDone: false
  } as TripStop
  trip.days[day][slot].splice(index + 1, 0, copy)
  trip.updatedAt = new Date().toISOString()
  persistUserData()
  showToast('已复制行程条目', 'success')
}

function appendTipToTrip(spotId: string, tip: string) {
  const trip = currentTrip.value
  if (!trip) {
    showToast('请先加入行程后再添加贴士', 'warning')
    return false
  }

  const target = dayKeys
    .flatMap((day) => getDayStops(trip, day))
    .find((item) => item.kind === 'spot' && item.spotId === spotId)
  if (!target) {
    showToast('请先将景点加入行程', 'warning')
    return false
  }

  const remark = target.remark ? `${target.remark}\n${tip}` : tip
  target.remark = remark
  trip.updatedAt = new Date().toISOString()
  persistUserData()
  showToast('贴士已添加到行程备注', 'success')
  return true
}

function setDayNote(day: DayKey, note: string) {
  if (!currentTrip.value) return
  currentTrip.value.dayNotes[day] = note
  currentTrip.value.updatedAt = new Date().toISOString()
  persistUserData()
}

function addPackingItem(label: string, category: PackingItem['category']) {
  if (!currentUser.value) return false
  const nextLabel = label.trim()
  if (!nextLabel) return false

  currentUser.value.packingList = [
    ...currentUser.value.packingList,
    {
      id: `pack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: nextLabel,
      category,
      done: false
    }
  ]
  persistUsers()
  return true
}

function togglePackingItem(itemId: string) {
  const item = currentUser.value?.packingList.find((pack) => pack.id === itemId)
  if (!item) return
  item.done = !item.done
  persistUsers()
}

function removePackingItem(itemId: string) {
  if (!currentUser.value) return
  currentUser.value.packingList = currentUser.value.packingList.filter(
    (item) => item.id !== itemId
  )
  persistUsers()
}

function applyPackingTemplate(template: 'altitude' | 'hiking') {
  if (!currentUser.value) return

  const source =
    template === 'altitude'
      ? [
          ['防晒霜', '高原'],
          ['墨镜', '高原'],
          ['薄羽绒服', '高原'],
          ['常用药品', '通用'],
          ['保温杯', '通用']
        ]
      : [
          ['徒步鞋', '徒步'],
          ['登山杖', '徒步'],
          ['冲锋衣', '徒步'],
          ['雨衣', '通用'],
          ['能量补给', '通用']
        ]

  const existing = new Set(
    currentUser.value.packingList.map((item) => item.label)
  )
  const additions = source
    .filter(([label]) => !existing.has(label))
    .map(([label, category]) => ({
      id: `pack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label,
      category: category as PackingItem['category'],
      done: false
    }))

  currentUser.value.packingList = [
    ...currentUser.value.packingList,
    ...additions
  ]
  persistUsers()
  showToast('装备模板已应用', 'success')
}

function setFoodLodging(value: number) {
  if (!currentTrip.value) return
  currentTrip.value.foodLodging = Math.max(0, Number(value) || 0)
  currentTrip.value.updatedAt = new Date().toISOString()
  persistUserData()
}

function isSpotPlanned(spotId: string) {
  if (!currentTrip.value) return false
  return dayKeys.some((day) =>
    getDayStops(currentTrip.value!, day).some(
      (tripStop) =>
        tripStop.kind === 'spot' && tripStop.spot.id === spotId
    )
  )
}

function exportTripText(trip: Trip) {
  const lines = dayKeys.map((day) => {
    const schedule = calculateDaySchedule(getDayStops(trip, day), day)
    const stops = schedule
      .map((entry, index) => {
        const duration = formatDuration(getStopDurationMinutes(entry.stop))
        const drive =
          entry.driveToNextMinutes > 0
            ? `，下一站约${formatDuration(entry.driveToNextMinutes)}车程`
            : ''
        const remark = entry.stop.remark
          ? `，备注：${entry.stop.remark}`
          : ''
        const tips =
          entry.stop.kind === 'spot' && entry.stop.spotTips?.length
            ? `，贴士：${entry.stop.spotTips.join('；')}`
            : ''
        return `${index + 1}. ${entry.stop.title}（${duration}${drive}${remark}${tips}）`
      })
      .join('\n')
    const notes = trip.dayNotes[day] ? `\n当日补充：${trip.dayNotes[day]}` : ''
    return `${day}\n${stops || '暂无安排'}${notes}`
  })
  const budget = calculateTripBudget(trip)

  return [
    `山野行｜${trip.name}`,
    `旅行大区：${trip.regionName}`,
    '',
    ...lines,
    '',
    `门票合计：¥${budget.tickets}`,
    `食宿费用：¥${budget.foodLodging}`,
    `总预算：¥${budget.total}`
  ].join('\n')
}

function getCurrentSpotPositions() {
  if (!currentTrip.value) return []

  return dayKeys.flatMap((day) =>
    timeSlots.flatMap((slot) =>
      currentTrip.value!.days[day][slot]
        .map((item, index) => ({
          day,
          slot,
          index,
          item
        }))
        .filter(
          (
            entry
          ): entry is {
            day: DayKey
            slot: TimeSlot
            index: number
            item: SpotTripStop
          } => entry.item.kind === 'spot'
        )
    )
  )
}

function requestRouteOptimization() {
  if (!currentTrip.value) return false

  const beforeItems = getCurrentSpotPositions().map((entry) => entry.item)
  if (beforeItems.length < 3) {
    showToast('至少添加 3 个景点后才能进行路线优化', 'warning')
    return false
  }

  let afterItems = optimizeSpotsByLocation(beforeItems)
  const beforeDistanceKm = calculateSpotRouteDistance(beforeItems)
  const optimizedDistanceKm = calculateSpotRouteDistance(afterItems)

  // 坐标算法没有明显改善时，保留原有按交通时间排序作为兜底。
  if (optimizedDistanceKm >= beforeDistanceKm * 0.995) {
    afterItems = optimizeSpotOrder(beforeItems) as SpotTripStop[]
  }

  const afterDistanceKm = calculateSpotRouteDistance(afterItems)
  const improvementPercent =
    beforeDistanceKm > 0
      ? ((beforeDistanceKm - afterDistanceKm) / beforeDistanceKm) * 100
      : 0

  if (improvementPercent < 0.5) {
    showToast('当前景点顺序已经较优，无需调整', 'info')
    return false
  }

  routeOptimizationPreview.value = {
    beforeItems,
    afterItems,
    beforeLabels: beforeItems.map((item) => item.spot.name),
    afterLabels: afterItems.map((item) => item.spot.name),
    beforeDistanceKm,
    afterDistanceKm,
    improvementPercent
  }
  pendingOptimizedOrder.value = afterItems
  routeOptimizationOpen.value = true
  return true
}

function applyRouteOptimization() {
  if (!currentTrip.value || !pendingOptimizedOrder.value.length) return

  // 景点按推荐路线重新分配 Day / 时段；自定义条目保留在原位置。
  currentTrip.value.days = allocateOptimizedSpots(
    pendingOptimizedOrder.value,
    currentTrip.value.days
  )

  currentTrip.value.updatedAt = new Date().toISOString()
  routeOptimizationOpen.value = false
  routeOptimizationPreview.value = null
  pendingOptimizedOrder.value = []
  persistUserData()
  showToast('已应用推荐路线顺序', 'success')
}

function cancelRouteOptimization() {
  routeOptimizationOpen.value = false
  routeOptimizationPreview.value = null
  pendingOptimizedOrder.value = []
}

function optimizeCurrentTripOrder() {
  if (!currentTrip.value) return false

  dayKeys.forEach((day) => {
    timeSlots.forEach((slot) => {
      currentTrip.value!.days[day][slot] = optimizeSpotOrder(
        currentTrip.value!.days[day][slot]
      ) as TripStop[]
    })
  })
  currentTrip.value.updatedAt = new Date().toISOString()
  persistUserData()
  showToast('已按最短车程优化游览顺序', 'success')
  return true
}

watch(
  [favorites, trips],
  () => {
    persistUserData()
  },
  { deep: true }
)

if (!readStorage<StoredUser[] | null>(STORAGE_KEYS.users, null)) {
  persistUsers()
}

syncDarkClass()
loadUserData()

export function useTravelStore() {
  return {
    STORAGE_KEYS,
    dayKeys,
    theme,
    users,
    currentUser,
    currentRegionId,
    currentRegion,
    currentRegionSpots,
    favorites,
    favoriteSpots,
    favoriteCount,
    trips,
    currentTrip,
    currentTripSpotCount,
    currentTripBudget,
    activeTripId,
    regionSwitchOpen,
    pendingRegionId,
    routeOptimizationOpen,
    routeOptimizationPreview,
    toast,
    requireLogin,
    register,
    login,
    logout,
    updateNickname,
    clearAllData,
    toggleTheme,
    isFavorite,
    toggleFavorite,
    requestRegionChange,
    cancelRegionSwitch,
    confirmRegionSwitch,
    createTrip,
    deleteTrip,
    openTrip,
    getTripById,
    addSpotToTrip,
    removeTripStop,
    handlePlannerChange,
    createDragClone,
    createCustomDragClone,
    addCustomSourceItem,
    removeCustomSourceItem,
    createUserCustomDragClone,
    customSourceItems,
    updateTripItem,
    toggleTripItemDone,
    setTripItemDuration,
    setTripItemTime,
    setTripItemRemark,
    duplicateTripItem,
    appendTipToTrip,
    setDayNote,
    setFoodLodging,
    isSpotPlanned,
    calculateTripBudget,
    calculateDayStats,
    exportTripText,
    optimizeCurrentTripOrder,
    requestRouteOptimization,
    applyRouteOptimization,
    cancelRouteOptimization,
    addPackingItem,
    togglePackingItem,
    removePackingItem,
    applyPackingTemplate,
    showToast
  }
}
