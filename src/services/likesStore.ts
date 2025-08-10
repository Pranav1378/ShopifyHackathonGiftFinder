export type LikedItem = {
  id: string
  title: string
  imageUrl: string
  priceLabel: string
  likedAt: number
}

const STORAGE_KEY = 'gf_likes_v1'

function read(): LikedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as LikedItem[] : []
  } catch {
    return []
  }
}

function write(items: LikedItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function getAllLikes(): LikedItem[] {
  return read().sort((a, b) => b.likedAt - a.likedAt)
}

export function addLike(item: Omit<LikedItem, 'likedAt'>) {
  const list = read()
  const exists = list.some((x) => x.id === item.id)
  const next = exists ? list : [{ ...item, likedAt: Date.now() }, ...list]
  write(next)
}

export function removeLike(id: string) {
  const list = read().filter((x) => x.id !== id)
  write(list)
}

export function clearLikes() {
  write([])
}


