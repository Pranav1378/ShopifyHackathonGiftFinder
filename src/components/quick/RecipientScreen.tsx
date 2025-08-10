import React, { useEffect, useMemo, useState } from 'react'
import { Button, Chip, Card } from '../../ui/Playground'
import { useProfiles } from '../../services/useProfiles'
import { RecipientProfile } from '../../types/quickPicker'

type RecipientScreenProps = {
  onContinue: (profile: RecipientProfile) => void
  onManageProfiles: () => void
}

export function RecipientScreen({ onContinue, onManageProfiles }: RecipientScreenProps) {
  const { listProfiles, getLastUsed, upsertProfiles } = useProfiles()
  const [profiles, setProfiles] = useState<RecipientProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listProfiles(), getLastUsed()]).then(async ([p, last]) => {
      if (!p || p.length === 0) {
        const demo: RecipientProfile[] = [
          { id: 'p_mom', displayName: 'Mom' },
          { id: 'p_partner', displayName: 'Partner' },
          { id: 'p_friend', displayName: 'Friend' },
        ]
        await upsertProfiles(demo)
        setProfiles(demo)
        setSelectedId(demo[0].id)
        return
      }
      setProfiles(p)
      if (last?.profileId) setSelectedId(last.profileId)
    })
  }, [listProfiles, getLastUsed, upsertProfiles])

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
      <Card>
        <div className="flex gap-2 overflow-x-auto">
          {ordered.length === 0 && (
            <div className="text-sm text-gray-500 py-2">No profiles yet</div>
          )}
          {ordered.map((p) => (
            <Chip
              key={p.id}
              aria-pressed={selectedId === p.id}
              className={`min-w-[88px] h-11 px-3 text-sm ${selectedId === p.id ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setSelectedId(p.id)}
            >
              <span className="mr-1">😊</span>{p.displayName}
            </Chip>
          ))}
        </div>
      </Card>
      <div className="mt-6">
        <Button
          className={`w-full ${selectedProfile ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`}
          disabled={!selectedProfile}
          onClick={() => selectedProfile && onContinue(selectedProfile)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

