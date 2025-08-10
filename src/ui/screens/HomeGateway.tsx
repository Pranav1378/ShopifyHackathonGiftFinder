import React, {useEffect, useMemo, useState} from 'react'
import {useProfilesAdapter, type UiProfile} from '../adapters/dataAdapters'
import {Button, Card, Chip} from '../../ui/Playground'

type Props = {
  onCreateNew: () => void
  onOpenExisting: (profileId: string) => void
}

export function HomeGateway({onCreateNew, onOpenExisting}: Props) {
  const {listUiProfiles, getLastUsed, setLastUsed} = useProfilesAdapter()
  const [profiles, setProfiles] = useState<UiProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [list, last] = await Promise.all([listUiProfiles(), getLastUsed()])
      if (!mounted) return
      setProfiles(list)
      if (last?.profileId && list.some(p => p.id === last.profileId)) {
        setSelectedId(last.profileId)
      } else if (list[0]) {
        setSelectedId(list[0].id)
      }
    })()
    return () => { mounted = false }
  }, [listUiProfiles, getLastUsed])

  const selectedProfile = useMemo(() => profiles.find(p => p.id === selectedId) || null, [profiles, selectedId])

  const openSelected = async () => {
    if (!selectedProfile) return
    await setLastUsed({profileId: selectedProfile.id})
    onOpenExisting(selectedProfile.id)
  }

  return (
    <div className="pt-16 pb-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Find the perfect gift</h1>
        <p className="text-sm text-gray-600 mt-1">Create a new recipient or pick from your saved profiles</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 flex flex-col items-center justify-between">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{background: 'var(--surface-2)'}}>
            ✨
          </div>
          <div className="mt-3 font-semibold">New Profile</div>
          <Button className="mt-3 w-full bg-blue-600 text-white" onClick={onCreateNew}>
            Create
          </Button>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-between">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl" style={{background: 'var(--surface-2)'}}>
            😊
          </div>
          <div className="mt-3 font-semibold">Existing Profiles</div>
          <div className="mt-2 w-full">
            <button
              className="w-full h-11 px-3 rounded-xl border bg-white flex items-center justify-between text-left"
              aria-haspopup="listbox"
              aria-expanded={showPicker}
              onClick={() => setShowPicker(v => !v)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                  {selectedProfile?.initials || '—'}
                </div>
                <span className="text-sm truncate">{selectedProfile?.displayName || 'Choose profile'}</span>
              </div>
              <span aria-hidden>▾</span>
            </button>
            {showPicker && (
              <div role="listbox" className="mt-2 rounded-2xl border bg-white shadow-md max-h-64 overflow-auto">
                <div className="p-2 grid grid-cols-4 gap-2">
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      role="option"
                      aria-selected={selectedId === p.id}
                      onClick={() => { setSelectedId(p.id); setShowPicker(false) }}
                      className={`h-16 rounded-xl border flex flex-col items-center justify-center text-xs ${selectedId===p.id ? 'border-blue-600' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm mb-1">
                        {p.initials}
                      </div>
                      <span className="truncate px-1">{p.displayName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button className={`mt-3 w-full ${selectedProfile ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`} disabled={!selectedProfile} onClick={openSelected}>
            Open
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default HomeGateway


