import type {
  DayKey,
  Spot,
  SpotTripStop,
  TimeSlot,
  TripDays,
  TripStop
} from '../types/travel'

export const timeSlots: TimeSlot[] = [
  'morning',
  'afternoon',
  'evening',
  'night'
]

export const timeSlotMeta: Record<
  TimeSlot,
  { label: string; startMinutes: number }
> = {
  morning: {
    label: '上午',
    startMinutes: 9 * 60
  },
  afternoon: {
    label: '下午',
    startMinutes: 13 * 60 + 30
  },
  evening: {
    label: '傍晚',
    startMinutes: 17 * 60 + 30
  },
  night: {
    label: '夜间',
    startMinutes: 20 * 60
  }
}

export interface ScheduleEntry {
  stop: TripStop
  slot: TimeSlot
  arrivalMinutes: number
  endMinutes: number
  driveToNextMinutes: number
}

export function parseDurationMinutes(duration: string) {
  if (duration.includes('半天')) return 240
  if (duration.includes('1天')) return 480
  if (duration.includes('3-4小时')) return 210

  const hours = duration.match(/([\d.]+)\s*小时/)
  if (hours) return Math.round(Number(hours[1]) * 60)

  const days = duration.match(/([\d.]+)\s*天/)
  if (days) return Math.round(Number(days[1]) * 480)

  return 120
}

export function getStopDurationMinutes(stop: TripStop) {
  return stop.userDuration || stop.recommendDuration
}

export function getDriveMinutesBetween(
  from: TripStop | undefined,
  to: TripStop | undefined
) {
  if (!from || !to || from.kind !== 'spot' || to.kind !== 'spot') return 0

  return (
    from.spot.driveTime[to.spot.id] ??
    to.spot.driveTime[from.spot.id] ??
    30
  )
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}分钟`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}小时${rest}分钟` : `${hours}小时`
}

export function formatClock(totalMinutes: number) {
  const normalized = Math.max(0, Math.round(totalMinutes))
  const hours = Math.floor(normalized / 60) % 24
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function calculateGeoDistanceKm(from: Spot, to: Spot) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371
  const latDelta = toRadians(to.location.lat - from.location.lat)
  const lngDelta = toRadians(to.location.lng - from.location.lng)
  const fromLat = toRadians(from.location.lat)
  const toLat = toRadians(to.location.lat)

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(lngDelta / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calculateSpotRouteDistance(route: SpotTripStop[]) {
  return route.reduce((total, stop, index) => {
    const nextStop = route[index + 1]
    return nextStop
      ? total + calculateGeoDistanceKm(stop.spot, nextStop.spot)
      : total
  }, 0)
}

/**
 * 简化 TSP：
 * 1. 对每个景点尝试作为起点，使用最近邻生成基础路线；
 * 2. 使用 2-opt 反转局部路径，继续减少总空间距离；
 * 3. 返回总距离最短的一条推荐顺序。
 */
export function optimizeSpotsByLocation(spots: SpotTripStop[]) {
  if (spots.length < 3) return [...spots]

  const nearestNeighbor = (startIndex: number) => {
    const remaining = [...spots]
    const route = [remaining.splice(startIndex, 1)[0]]

    while (remaining.length) {
      const current = route[route.length - 1]
      let nearestIndex = 0
      let nearestDistance = Number.POSITIVE_INFINITY

      remaining.forEach((candidate, index) => {
        const distance = calculateGeoDistanceKm(current.spot, candidate.spot)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })

      route.push(remaining.splice(nearestIndex, 1)[0])
    }

    return route
  }

  let bestRoute = nearestNeighbor(0)
  let bestDistance = calculateSpotRouteDistance(bestRoute)

  for (let startIndex = 1; startIndex < spots.length; startIndex += 1) {
    const candidate = nearestNeighbor(startIndex)
    const distance = calculateSpotRouteDistance(candidate)
    if (distance < bestDistance) {
      bestRoute = candidate
      bestDistance = distance
    }
  }

  let improved = true
  while (improved) {
    improved = false

    for (let start = 0; start < bestRoute.length - 2; start += 1) {
      for (let end = start + 1; end < bestRoute.length - 1; end += 1) {
        const candidate = [
          ...bestRoute.slice(0, start + 1),
          ...bestRoute.slice(start + 1, end + 1).reverse(),
          ...bestRoute.slice(end + 1)
        ]
        const distance = calculateSpotRouteDistance(candidate)

        if (distance + 0.0001 < bestDistance) {
          bestRoute = candidate
          bestDistance = distance
          improved = true
        }
      }
    }
  }

  return bestRoute
}

export const DAY_PLAN_LIMIT_MINUTES = 9 * 60

/**
 * 将优化后的景点按游玩时长重新分配到三天。
 * - 上午/下午为首选时段；
 * - 单日累计不超过 9 小时，除非当天只有一个超长景点；
 * - 用户自定义条目保留在原 Day / 时段，不会被删除。
 */
export function allocateOptimizedSpots(
  optimizedSpots: SpotTripStop[],
  originalDays: TripDays
): TripDays {
  const result: TripDays = {
    Day1: { morning: [], afternoon: [], evening: [], night: [] },
    Day2: { morning: [], afternoon: [], evening: [], night: [] },
    Day3: { morning: [], afternoon: [], evening: [], night: [] }
  }
  const dayKeys: DayKey[] = ['Day1', 'Day2', 'Day3']

  // 先保留用户自定义条目及其原来的日期、时段。
  dayKeys.forEach((day) => {
    timeSlots.forEach((slot) => {
      result[day][slot] = originalDays[day][slot].filter(
        (item) => item.kind === 'custom'
      )
    })
  })

  const dayMinutes = dayKeys.reduce<Record<DayKey, number>>(
    (totals, day) => {
      totals[day] = timeSlots.reduce(
        (total, slot) =>
          total +
          result[day][slot].reduce(
            (slotTotal, item) =>
              slotTotal + getStopDurationMinutes(item),
            0
          ),
        0
      )
      return totals
    },
    {
      Day1: 0,
      Day2: 0,
      Day3: 0
    }
  )

  let dayIndex = 0

  optimizedSpots.forEach((item) => {
    const duration = getStopDurationMinutes(item)

    // 当前 Day 放不下时，优先移动到下一天。
    while (
      dayIndex < dayKeys.length - 1 &&
      dayMinutes[dayKeys[dayIndex]] > 0 &&
      dayMinutes[dayKeys[dayIndex]] + duration > DAY_PLAN_LIMIT_MINUTES
    ) {
      dayIndex += 1
    }

    const day = dayKeys[dayIndex]
    const slot: TimeSlot =
      dayMinutes[day] < DAY_PLAN_LIMIT_MINUTES / 2
        ? 'morning'
        : 'afternoon'

    item.slot = slot
    item.period = slot
    item.dayIndex = dayIndex
    result[day][slot].push(item)
    dayMinutes[day] += duration
  })

  return result
}

function parseClock(value?: string) {
  if (!value) return undefined
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined
  return hours * 60 + minutes
}

export function calculateDaySchedule(
  stops: TripStop[],
  day: DayKey
): ScheduleEntry[] {
  const ordered = timeSlots.flatMap((slot) =>
    stops.filter((stop) => stop.slot === slot)
  )
  let previousEnd = 0

  return ordered.map((stop, index) => {
    const baseStart =
      parseClock(stop.startTime) ?? timeSlotMeta[stop.slot].startMinutes
    const previousStop = index > 0 ? ordered[index - 1] : undefined
    const driveToCurrent = getDriveMinutesBetween(previousStop, stop)
    const arrivalMinutes = Math.max(
      baseStart,
      (previousEnd || baseStart) + driveToCurrent
    )
    const lockedEnd = parseClock(stop.endTime)
    const endMinutes =
      lockedEnd !== undefined && lockedEnd >= arrivalMinutes
        ? lockedEnd
        : arrivalMinutes + getStopDurationMinutes(stop)
    const nextStop = ordered[index + 1]

    previousEnd = endMinutes

    return {
      stop,
      slot: stop.slot,
      arrivalMinutes,
      endMinutes,
      driveToNextMinutes: getDriveMinutesBetween(stop, nextStop)
    }
  })
}

export function calculateDayActiveMinutes(stops: TripStop[]) {
  const schedule = calculateDaySchedule(stops, 'Day1')
  if (!schedule.length) return 0

  return (
    schedule[schedule.length - 1].endMinutes -
    schedule[0].arrivalMinutes +
    schedule.reduce((total, entry) => total + entry.driveToNextMinutes, 0)
  )
}

function orderScore(route: SpotTripStop[]) {
  return route.reduce((total, stop, index) => {
    const next = route[index + 1]
    return total + getDriveMinutesBetween(stop, next)
  }, 0)
}

export function optimizeSpotOrder(stops: TripStop[]) {
  const spotStops = stops.filter(
    (stop): stop is SpotTripStop => stop.kind === 'spot'
  )
  const customStops = stops.filter((stop) => stop.kind === 'custom')

  if (spotStops.length < 3) return stops

  let bestOrder = [...spotStops]
  let bestScore = orderScore(bestOrder)

  for (const start of spotStops) {
    const remaining = spotStops.filter((stop) => stop.planId !== start.planId)
    const route = [start]

    while (remaining.length) {
      const current = route[route.length - 1]
      let nearestIndex = 0
      let nearestMinutes = Number.POSITIVE_INFINITY

      remaining.forEach((candidate, index) => {
        const minutes = getDriveMinutesBetween(current, candidate)
        if (minutes < nearestMinutes) {
          nearestMinutes = minutes
          nearestIndex = index
        }
      })

      route.push(remaining.splice(nearestIndex, 1)[0])
    }

    const score = orderScore(route)
    if (score < bestScore) {
      bestOrder = route
      bestScore = score
    }
  }

  return [...bestOrder, ...customStops]
}
