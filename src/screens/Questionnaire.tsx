import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cake, Gift, Heart, PartyPopper, Plane, Sparkles, Music, Dumbbell, Gamepad2, Book, ChefHat, Home, Palette, Trees, Shirt, Headphones, Camera } from 'lucide-react'
import { callFal as defaultCallFal } from '../services/falClient'
import { buildFalRequest as defaultBuildFalRequest } from '../services/falPayload'

export default function RadianceQuickSetup({
  profileId,
  onBack,
  onSuccess,
  callFal = defaultCallFal,
  buildFalRequest = defaultBuildFalRequest,
  startingBudget = 50,
}: {
  profileId?: string;
  onBack: () => void;
  onSuccess?: (out: unknown) => void;
  callFal?: (payload: any) => Promise<any>;
  buildFalRequest?: (intent: any) => any;
  startingBudget?: number;
}) {
  const [budget, setBudget] = React.useState<number>(startingBudget)
  const [occasion, setOccasion] = React.useState<string | undefined>()
  const [interests, setInterests] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [output, setOutput] = React.useState<string>('')

  const INTERESTS = React.useMemo(() => [
    { id: 'tech', label: 'tech', icon: <Sparkles className="size-4" /> },
    { id: 'travel', label: 'travel', icon: <Plane className="size-4" /> },
    { id: 'reading', label: 'reading', icon: <Book className="size-4" /> },
    { id: 'cooking', label: 'cooking', icon: <ChefHat className="size-4" /> },
    { id: 'gardening', label: 'gardening', icon: <Trees className="size-4" /> },
    { id: 'fitness', label: 'fitness', icon: <Dumbbell className="size-4" /> },
    { id: 'music', label: 'music', icon: <Music className="size-4" /> },
    { id: 'fashion', label: 'fashion', icon: <Shirt className="size-4" /> },
    { id: 'gaming', label: 'gaming', icon: <Gamepad2 className="size-4" /> },
    { id: 'home', label: 'home', icon: <Home className="size-4" /> },
    { id: 'art', label: 'art', icon: <Palette className="size-4" /> },
    { id: 'photo', label: 'photo', icon: <Camera className="size-4" /> },
    { id: 'audio', label: 'audio', icon: <Headphones className="size-4" /> },
  ], [])

  const OCCASIONS = [
    { id: 'birthday', label: 'birthday', icon: <Cake className="size-4" /> },
    { id: 'anniversary', label: 'anniversary', icon: <Heart className="size-4" /> },
    { id: 'thank you', label: 'thank you', icon: <Gift className="size-4" /> },
    { id: 'holiday', label: 'holiday', icon: <Plane className="size-4" /> },
    { id: 'just because', label: 'just because', icon: <Sparkles className="size-4" /> },
  ]

  const toggleInterest = (id: string) => setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const progress = React.useMemo(() => {
    let p = 0; if (budget) p += 35; if (occasion) p += 35; if (interests.length > 0) p += 30; return Math.min(100, p)
  }, [budget, occasion, interests])

  React.useEffect(() => {
    try { localStorage.setItem('radiance-setup', JSON.stringify({ budget, occasion, interests })) } catch {}
  }, [budget, occasion, interests])

  React.useEffect(() => {
    try { const raw = localStorage.getItem('radiance-setup'); if (raw) { const v = JSON.parse(raw); if (v?.budget) setBudget(v.budget); if (v?.occasion) setOccasion(v.occasion); if (Array.isArray(v?.interests)) setInterests(v.interests) } } catch {}
  }, [])

  const onSubmit = async () => {
    if (!callFal || !buildFalRequest) return
    const intent = { profileId: profileId || 'new_profile', budget, occasion, vibes: interests }
    const payload = buildFalRequest(intent as any)
    setLoading(true)
    try {
      const res = await callFal(payload)
      setOutput(res)
      try { const parsed = JSON.parse(res); onSuccess?.(parsed) } catch {}
    } catch (e: any) {
      setOutput(`{"error":"${e?.message || 'Fal call failed'}"}`)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-purple-50 dark:from-neutral-900 dark:via-neutral-900/60 dark:to-neutral-950">
      <motion.div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-400/40 to-indigo-400/40 blur-3xl" animate={{ y: [0, 10, -6, 0], x: [0, -4, 6, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div aria-hidden className="pointer-events-none absolute bottom-[-80px] right-[-80px] h-96 w-96 rounded-full bg-gradient-to-tr from-sky-400/40 to-violet-400/40 blur-3xl" animate={{ y: [0, -8, 4, 0], x: [0, 6, -6, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative pt-6 px-4 max-w-xl mx-auto">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">Back</button>
        <div className="mt-6 text-center">
          <motion.h1 className="text-3xl font-extrabold tracking-tight" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>Quick setup</motion.h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Budget, occasion, and interests — that’s it.</p>
        </div>
        <div className="mt-6">
          <div className="h-2.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" initial={false} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 110, damping: 20 }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{progress < 100 ? `Almost there… ${progress}%` : 'Ready!'}</span>
            <span className="rounded-full bg-white/70 dark:bg-white/5 backdrop-blur px-2 py-0.5">{interests.length} interests</span>
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-36 max-w-xl mx-auto">
        <div className="mt-5 rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-5 shadow-[0_2px_30px_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold mb-2">Budget</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input aria-label="Budget" type="range" min={5} max={500} step={5} value={budget} onChange={(e) => setBudget(parseInt(e.target.value, 10))} className="w-full accent-indigo-600" />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500"><span>$5</span><span>$500</span></div>
            </div>
            <div className="w-[110px]"><label className="group relative block"><span className="absolute -top-2 left-3 px-1 text-[10px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur rounded">USD</span><input inputMode="numeric" className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm shadow-inner outline-none focus:ring-2 focus:ring-indigo-500/50" value={String(budget)} onChange={(e) => setBudget(Number(e.target.value.replace(/[^0-9]/g, '')) || 5)} /></label></div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs"><span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-1"><Sparkles className="size-3" /> sweet‑spot: $40–$80</span></div>
        </div>

        <div className="mt-5 rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-5 shadow-[0_2px_30px_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold mb-2">Occasion</div>
          <div className="flex flex-wrap gap-2">{OCCASIONS.map(o => (<Chip key={o.id} label={o.label} selected={occasion === o.id} icon={o.icon} onClick={() => setOccasion(occasion === o.id ? undefined : o.id)} />))}</div>
        </div>

        <div className="mt-5 rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-5 shadow-[0_2px_30px_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold mb-2">Interests</div>
          <div className="flex flex-wrap gap-2">{INTERESTS.map(i => (<Chip key={i.id} label={i.label} selected={interests.includes(i.id)} icon={i.icon} onClick={() => toggleInterest(i.id)} />))}</div>
          <p className="mt-2 text-xs text-gray-500">Pick as many as you like — we’ll blend them into the gift search.</p>
        </div>

        <AnimatePresence>{output && (<motion.pre initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4 text-[11px] leading-relaxed whitespace-pre-wrap break-all rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur p-4 border border-black/5 dark:border-white/10">{output}</motion.pre>)}</AnimatePresence>
      </div>

      <div className="fixed left-0 right-0 bottom-0 z-10">
        <div className="mx-auto max-w-xl px-4 pb-6">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-1 shadow-xl">
            <div className="rounded-[14px] bg-white/70 dark:bg-neutral-900/60 backdrop-blur px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white"><PartyPopper className="size-4 text-indigo-600" /><span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{occasion ? `For ${occasion}` : 'Set an occasion'} · ${budget}</span></div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={onSubmit} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-60">{loading ? 'Generating…' : 'Generate search JSON'}</motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ label, selected, onClick, icon }: { label: string; selected?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} aria-pressed={!!selected} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition shadow-sm ${selected ? 'border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-800 dark:text-gray-200 hover:bg-white'}`}>
      {icon}
      <span className="capitalize">{label}</span>
    </motion.button>
  )
}
