import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import GradientButton from '../components/ui/GradientButton'
import ProfilePickerSheet from '../components/ui/ProfilePickerSheet'
import { useProfiles } from '../services/useProfiles'

/**
 * Ultra‑minimal start screen (v2, Gift Finder)
 * — Oversized 3D script title that mimics puffy lettering
 * — Ambient gradient blobs
 * — Two actions fixed at the bottom: Create new / Add to existing
 * — Motion respects prefers-reduced-motion
 *
 * NOTE: To match the script look, include a cursive display font (e.g., Lobster or Pacifico).
 * In your HTML shell add:
 * <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet" />
 * This component uses className: font-['Lobster',cursive]
 */

type Props = { onCreate: () => void; onOpen: (profileId: string) => void }

type UiItem = { id: string; displayName: string; initials: string; colorIndex: number }

function initialsOf(name?: string) {
  if (!name) return '🙂'
  const parts = name.trim().split(' ').filter(Boolean)
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).filter(Boolean)
  return letters.join('') || name[0]?.toUpperCase() || '🙂'
}

export default function StartScreen({ onCreate, onOpen }: Props) {
  const prefersReduced = useReducedMotion()
  const { listProfiles, getLastUsed, setLastUsed, upsertProfiles } = useProfiles()
  const [profiles, setProfiles] = useState<UiItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [raw, last] = await Promise.all([listProfiles(), getLastUsed()])
      if (!mounted) return
      let seed = raw || []
      if (seed.length === 0) {
        seed = [
          { id: 'p_mom', displayName: 'Mom', styleTags: ['classic', 'neutral'], favColors: ['earth tones'], dislikedTags: ['strong fragrance'] },
          { id: 'p_friend', displayName: 'Friend', styleTags: ['modern', 'minimal'], favColors: ['blue', 'black'], dislikedTags: ['clutter'] },
          { id: 'p_gf', displayName: 'Girlfriend', styleTags: ['luxury', 'colorful'], favColors: ['pastels', 'pink'], dislikedTags: ['synthetic'] },
        ] as any
        try { await upsertProfiles(seed as any) } catch {}
      }
      const items: UiItem[] = (seed || []).map((p, i) => ({ id: p.id, displayName: p.displayName, initials: initialsOf(p.displayName), colorIndex: i }))
      setProfiles(items)
      if (last?.profileId && items.some((i) => i.id === last.profileId)) setSelectedId(last.profileId)
      else if (items[0]) setSelectedId(items[0].id)
    })()
    return () => { mounted = false }
  }, [listProfiles, getLastUsed])

  const selected = useMemo(() => profiles.find((p) => p.id === selectedId) || null, [profiles, selectedId])

  const handleOpen = async () => {
    if (!selected) return setSheetOpen(true)
    await setLastUsed({ profileId: selected.id })
    onOpen(selected.id)
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-purple-50 dark:from-neutral-900 dark:via-neutral-900/60 dark:to-neutral-950">
      {/* Ambient blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-36 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-400/20 to-indigo-400/20 blur-[80px]"
        animate={prefersReduced ? undefined : { y: [0, 8, -6, 0], x: [0, -4, 4, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-100px] right-[-100px] h-96 w-96 rounded-full bg-gradient-to-tr from-sky-400/25 to-violet-400/25 blur-3xl"
        animate={prefersReduced ? undefined : { y: [0, -6, 4, 0], x: [0, 6, -6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Title fills the screen */}
      <div className="relative mx-auto max-w-3xl px-4 pt-28 pb-44 md:pb-52 flex items-center justify-center">
        {/* Soft spotlight halo behind title for contrast */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -top-8 h-[40vh] -z-10 bg-[radial-gradient(65%_55%_at_50%_30%,rgba(255,255,255,0.92),rgba(255,255,255,0.35),transparent)] blur-2xl"
        />
        <BubbleScriptTitle prefersReduced={!!prefersReduced} lines={["Gift", "Finder"]} />
      </div>

      {/* Bottom actions */}
      <div className="fixed inset-x-0 bottom-6 z-10">
        <div className="mx-auto max-w-xl px-4 pb-[max(20px,env(safe-area-inset-bottom))]">
          <div className="rounded-3xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-black/5 dark:border-white/10 p-3 shadow-[0_4px_60px_rgba(0,0,0,0.08)]">
            <div className="space-y-3">
          <GradientButton fullWidth onClick={onCreate} aria-label="Create a new profile" className="text-base py-3 rounded-2xl">
            Create new profile
          </GradientButton>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => (selected ? handleOpen() : setSheetOpen(true))}
                className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-white/5 backdrop-blur px-4 py-3 text-base font-semibold text-gray-900 dark:text-gray-100 shadow-sm"
            aria-label="Add to existing profile"
          >
            Add to existing profile
          </motion.button>
        </div>
          </div>
        </div>
      </div>

      {/* Existing profile picker */}
      <ProfilePickerSheet open={sheetOpen} onClose={() => setSheetOpen(false)} items={profiles} onSelect={(id) => setSelectedId(id)} />
    </div>
  )
}

// ————————————————————————————————————————————
// Script/bubble title inspired by the reference image
function BubbleScriptTitle({ lines, prefersReduced }: { lines: string[]; prefersReduced: boolean }) {
  const [sheenPos, setSheenPos] = useState<{ x: number; y: number }>({ x: 50, y: 35 })

  // Optional device-orientation driven sheen. Falls back gracefully and
  // respects reduced-motion.
  useEffect(() => {
    if (prefersReduced || typeof window === 'undefined') return

    const handle = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0 // left-right tilt (-90 to 90)
      const beta = e.beta ?? 0 // front-back tilt (-180 to 180)
      const x = Math.max(0, Math.min(100, 50 + gamma * 0.8))
      const y = Math.max(0, Math.min(100, 40 + beta * 0.4))
      setSheenPos({ x, y })
    }

    let active = true
    const enable = async () => {
      try {
        const AnyMotion: any = (window as any).DeviceMotionEvent || (window as any).DeviceOrientationEvent
        if (AnyMotion && AnyMotion.requestPermission) {
          // iOS requires a user gesture; swallow errors silently
          await AnyMotion.requestPermission().catch(() => null)
        }
      } catch {}
      if (!active) return
      window.addEventListener('deviceorientation', handle as any)
    }
    void enable()
    return () => {
      active = false
      window.removeEventListener('deviceorientation', handle as any)
    }
  }, [prefersReduced])

  return (
    <div className="w-full text-center select-none">
      {lines.map((word, idx) => (
        <div key={word + idx} className="relative block">
          {/* Outer soft glow */}
      <span
        aria-hidden
            className="absolute inset-0 -z-10 block font-['Lobster',cursive] text-[clamp(110px,22vw,220px)] leading-[0.88]
                       text-fuchsia-400 blur-[2px]
                       [text-shadow:0_16px_36px_rgba(236,72,153,0.45),0_48px_96px_rgba(99,102,241,0.30)]"
      >
            {word}
      </span>

          {/* Main glossy fill with subtle sheen */}
      <motion.span
            className="relative block font-['Lobster',cursive] text-[clamp(110px,22vw,220px)] leading-[0.88]
                       bg-gradient-to-b from-fuchsia-200 via-fuchsia-500 to-fuchsia-700 bg-clip-text text-transparent italic
                       [-webkit-text-stroke:1.25px_rgba(255,255,255,0.95)]
                       [text-shadow:0_1px_0_#fff,0_3px_0_#fde6f2,0_6px_14px_rgba(0,0,0,0.18)]"
            style={{ backgroundSize: '200% 130%' }}
        animate={prefersReduced ? undefined : { backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
            {word}
            {/* Device-motion driven sheen overlay */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[40%]"
              style={{
                background: `radial-gradient(20% 20% at ${sheenPos.x}% ${sheenPos.y}%, rgba(255,255,255,0.95), rgba(255,255,255,0.0) 60%)`,
                mixBlendMode: 'screen',
                opacity: prefersReduced ? 0.5 : 0.85,
              }}
            />
      </motion.span>

          {/* Underline removed per request */}
        </div>
      ))}
    </div>
  )
}
