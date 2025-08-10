import React, { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import GradientButton from '../components/ui/GradientButton'
import ProfilePill from '../components/ui/ProfilePill'
import ProfilePickerSheet from '../components/ui/ProfilePickerSheet'
import { useProfiles } from '../services/useProfiles'

type Props = {
  onCreate: () => void
  onOpen: (profileId: string) => void
}

type UiItem = { id: string; displayName: string; initials: string; colorIndex: number }

function initialsOf(name?: string) {
  if (!name) return '🙂'
  const parts = name.trim().split(/\s+/)
  const letters = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).filter(Boolean)
  return letters.join('') || name[0]?.toUpperCase() || '🙂'
}

export function StartScreen({ onCreate, onOpen }: Props) {
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
          { id: 'p_mom', displayName: 'Mom', styleTags: ['classic','neutral'], favColors: ['earth tones'], dislikedTags: ['strong fragrance'] },
          { id: 'p_friend', displayName: 'Friend', styleTags: ['modern','minimal'], favColors: ['blue','black'], dislikedTags: ['clutter'] },
          { id: 'p_girlfriend', displayName: 'Girlfriend', styleTags: ['luxury','colorful'], favColors: ['pastels','pink'], dislikedTags: ['synthetic'] },
        ] as any
        try { await upsertProfiles(seed as any) } catch {}
      }
      const items: UiItem[] = (seed || []).map((p, i) => ({
        id: p.id,
        displayName: p.displayName,
        initials: initialsOf(p.displayName),
        colorIndex: i,
      }))
      setProfiles(items)
      if (last?.profileId && items.some(i => i.id === last.profileId)) setSelectedId(last.profileId)
      else if (items[0]) setSelectedId(items[0].id)
    })()
    return () => { mounted = false }
  }, [listProfiles, getLastUsed])

  const selected = useMemo(() => profiles.find(p => p.id === selectedId) || null, [profiles, selectedId])

  const handleOpen = async () => {
    if (!selected) return
    await setLastUsed({ profileId: selected.id })
    onOpen(selected.id)
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Background gradient and subtle shapes */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 dark:from-neutral-900 dark:to-neutral-950" aria-hidden />
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-pink-200/30 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-200/30 blur-3xl" aria-hidden />

      <div className="relative pt-16 pb-8 px-4">
        {/* Hero */}
        <div className="text-center mb-8 animate-[fadeIn_.3s_ease-out]">
          <h1 className="text-3xl font-bold">Find the perfect gift</h1>
          <p className="text-sm text-gray-600 mt-2">Create a recipient or pick an existing profile to get started</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          <GlassCard
            as="button"
            onClick={onCreate}
            aria-label="Create a new profile"
            className="p-5 flex flex-col items-center text-center active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-3xl bg-white/70 dark:bg-white/10 flex items-center justify-center text-3xl shadow-md">✨</div>
            <div className="mt-3 text-lg font-semibold">New Profile</div>
            <div className="mt-1 text-xs text-gray-600">Set up evergreen preferences</div>
            <GradientButton className="mt-4" aria-label="Create a new profile">Create</GradientButton>
          </GlassCard>

          <GlassCard className="p-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/70 dark:bg-white/10 flex items-center justify-center text-3xl shadow-md">😊</div>
            <div className="mt-3 text-lg font-semibold">Existing Profiles</div>
            <div className="mt-1 text-xs text-gray-600">Pick from your saved recipients</div>

            {/* Avatar pill strip */}
            <div className="mt-3 w-full">
              <div className="flex gap-3 overflow-x-auto px-1 py-1" role="listbox" aria-label="Saved profiles">
                {profiles.length === 0 && (
                  <div className="text-sm text-gray-500 py-2">No profiles yet</div>
                )}
                {profiles.map((p, i) => (
                  <ProfilePill
                    key={p.id}
                    label={p.displayName}
                    initials={p.initials}
                    colorIndex={i}
                    selected={selectedId === p.id}
                    onPress={() => setSelectedId(p.id)}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between w-full">
                <button className="text-sm text-blue-600" aria-label="View all profiles" onClick={() => setSheetOpen(true)}>
                  View all ▴
                </button>
                <GradientButton aria-label={selected ? `Open profile ${selected.displayName}` : 'Open profile'} onClick={handleOpen} disabled={!selected}>
                  Open
                </GradientButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <ProfilePickerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        items={profiles}
        onSelect={(id) => setSelectedId(id)}
      />
    </div>
  )
}

export default StartScreen


