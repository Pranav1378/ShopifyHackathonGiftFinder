import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ProfilePill } from './ProfilePill'

type Item = { id: string; displayName: string; initials?: string; colorIndex?: number }

type Props = {
  open: boolean
  items: Item[]
  onClose: () => void
  onSelect: (id: string) => void
}

export function ProfilePickerSheet({ open, items, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(i => i.displayName.toLowerCase().includes(q))
  }, [items, query])

  const scrimRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={scrimRef}
        className="absolute inset-0 bg-black/50"
        role="button"
        aria-label="Close profile picker"
        onClick={onClose}
      />
      <div className="absolute left-0 right-0 bottom-0 bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl">
        <div className="p-4">
          <div className="h-1 w-12 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-3" aria-hidden />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">All Profiles</h3>
            <button className="text-sm text-blue-600" onClick={onClose}>Close</button>
          </div>
          <div className="mb-3">
            <label className="sr-only" htmlFor="profile-search">Search profiles</label>
            <input
              id="profile-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search profiles"
              className="w-full h-11 px-3 rounded-xl border bg-white/80"
            />
          </div>
          <div className="grid grid-cols-4 gap-3 max-h-[50vh] overflow-auto pb-4">
            {filtered.map((p, i) => (
              <ProfilePill
                key={p.id}
                label={p.displayName}
                initials={p.initials}
                colorIndex={(p.colorIndex ?? i) % 6}
                onPress={() => { onSelect(p.id); onClose() }}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-4 text-center text-sm text-gray-500 py-6">No profiles</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePickerSheet


