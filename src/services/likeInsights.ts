type InsightsMap = Record<string, number>

const STORAGE_KEY = 'like_insights_v1'

function read(): InsightsMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed as InsightsMap : {}
  } catch {
    return {}
  }
}

function write(map: InsightsMap) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

export function getInsights(): InsightsMap {
  return read()
}

export function getCount(category: string): number {
  const map = read()
  return Number(map[category] ?? 0)
}

export function increment(category: string, delta = 1) {
  const map = read()
  const prev = Number(map[category] ?? 0)
  map[category] = prev + delta
  write(map)
}

export function incrementMany(categories: string[], delta = 1) {
  if (!categories || categories.length === 0) return
  const map = read()
  for (const c of categories) {
    const key = String(c)
    const prev = Number(map[key] ?? 0)
    map[key] = prev + delta
  }
  write(map)
}


