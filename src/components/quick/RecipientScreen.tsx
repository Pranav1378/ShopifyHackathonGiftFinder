import React, { useEffect, useMemo, useState } from 'react'
import { useProfiles } from '../../services/useProfiles'
import { RecipientProfile } from '../../types/quickPicker'

type RecipientScreenProps = {
  onContinue: (profile: RecipientProfile) => void
  onManageProfiles: () => void
}

export function RecipientScreen({ onContinue, onManageProfiles }: RecipientScreenProps) {
  const { listProfiles, getLastUsed } = useProfiles()
  const [profiles, setProfiles] = useState<RecipientProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listProfiles(), getLastUsed()]).then(([p, last]) => {
      setProfiles(p)
      if (last?.profileId) setSelectedId(last.profileId)
    })
  }, [listProfiles, getLastUsed])

  const ordered = useMemo(() => {
    return profiles
  }, [profiles])

  const selectedProfile = ordered.find(p => p.id === selectedId) || null

  return (
    <div className="pt-4 pb-6 px-4 safe-area-inset-bottom">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Who’s this for?</h2>
        <button onClick={onManageProfiles} className="text-sm text-blue-600">Manage</button>
      </div>
      <div className="rounded-2xl shadow-sm p-3 bg-white border">
        <div className="flex gap-2 overflow-x-auto">
          {ordered.length === 0 && (
            <div className="text-sm text-gray-500 py-2">No profiles yet</div>
          )}
          {ordered.map((p) => (
            <button
              key={p.id}
              aria-pressed={selectedId === p.id}
              className={`min-w-[88px] h-11 px-3 text-sm rounded-full border ${selectedId === p.id ? 'bg-blue-600 text-white' : 'bg-white'} active:scale-95`}
              onClick={() => setSelectedId(p.id)}
            >
              <span className="mr-1">😊</span>{p.displayName}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <button
          className={`w-full rounded-full h-12 text-white ${selectedProfile ? 'bg-blue-600' : 'bg-gray-300'}`}
          disabled={!selectedProfile}
          onClick={() => selectedProfile && onContinue(selectedProfile)}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

