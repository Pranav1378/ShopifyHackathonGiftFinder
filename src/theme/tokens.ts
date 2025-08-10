export const pastelBgClasses = [
  'bg-pink-100',
  'bg-blue-100',
  'bg-emerald-100',
  'bg-amber-100',
  'bg-violet-100',
  'bg-rose-100',
]

export const gradientPrimary = 'from-indigo-500 via-purple-500 to-pink-500'

export function pastelByIndex(index: number): string {
  const i = Math.max(0, index) % pastelBgClasses.length
  return pastelBgClasses[i]
}

export const radius = {
  card: 'rounded-3xl',
  pill: 'rounded-full',
}

export const shadows = {
  soft: 'shadow-lg',
}


