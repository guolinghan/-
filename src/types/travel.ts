export type DayKey = 'Day1' | 'Day2' | 'Day3'
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night'
export type CustomStopType =
  | 'hotel'
  | 'lunch'
  | 'dinner'
  | 'rest'

export interface GeoLocation {
  lng: number
  lat: number
  address: string
}

export interface Spot {
  id: string
  regionId: string
  name: string
  coverImg: string
  price: number
  typeTags: string[]
  bestSeason: string
  recommendDuration: number
  altitude: string
  suitablePeople: string
  location: GeoLocation
  driveTime: Record<string, number>
  intro: string
  tips: string[]
}

export interface Region {
  id: string
  name: string
  desc: string
  coverImg: string
  spotCount: number
  spots: Spot[]
}

interface BaseTripStop {
  id: string
  planId: string
  slot: TimeSlot
  period: TimeSlot
  dayIndex: number
  title: string
  recommendDuration: number
  userDuration: number
  startTime?: string
  endTime?: string
  driveToNext: number
  remark: string
  isDone: boolean
}

export interface SpotTripStop extends BaseTripStop {
  kind: 'spot'
  type: 'spot'
  spot: Spot
  spotId: string
  spotTags: string[]
  spotTips: string[]
  price: number
}

export interface CustomTripStop extends BaseTripStop {
  kind: 'custom'
  type: 'custom'
  customType: CustomStopType
  spotId?: undefined
  spotTags?: string[]
  spotTips?: string[]
  price?: number
}

export type TripStop = SpotTripStop | CustomTripStop

export type TripDaySlots = Record<TimeSlot, TripStop[]>

export type TripDays = Record<DayKey, TripDaySlots>

export interface Trip {
  id: string
  name: string
  regionId: string
  regionName: string
  days: TripDays
  dayNotes: Record<DayKey, string>
  foodLodging: number
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  favoriteSpotIds: string[]
  tripList: string[]
  packingList: PackingItem[]
  customItems: CustomSourceItem[]
}

export interface PackingItem {
  id: string
  label: string
  category: '高原' | '徒步' | '通用'
  done: boolean
}

export interface CustomSourceItem {
  id: string
  title: string
  recommendDuration: number
  userDuration: number
  preferredDay: DayKey
  preferredSlot: TimeSlot
  remark: string
}

export interface StoredUser {
  username: string
  password: string
  profile: UserProfile
}

export interface ToastState {
  visible: boolean
  message: string
  type: 'success' | 'warning' | 'info'
}

export interface TripBudget {
  tickets: number
  foodLodging: number
  total: number
}

export interface RouteOptimizationPreview {
  beforeItems: SpotTripStop[]
  afterItems: SpotTripStop[]
  beforeLabels: string[]
  afterLabels: string[]
  beforeDistanceKm: number
  afterDistanceKm: number
  improvementPercent: number
}
