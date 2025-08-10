import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Chip, Card, Input, Toast } from '../../ui/Playground'
import { RecipientProfile, GachaIntent } from '../../types/quickPicker'
import { useProfiles } from '../../services/useProfiles'

type DetailsScreenProps = {
  profile: RecipientProfile
  onSpin: (intent: GachaIntent) => void
  onRefine: () => void
}

const BUDGET_PRESETS = [25, 50, 75, 100]
const OCCASIONS = ['birthday','anniversary','thank you','just because','holiday','graduation']
const VIBES = ['cozy','minimalist','techy','outdoorsy','artsy','foodie','self-care']

export function DetailsScreen({ profile, onSpin, onRefine }: DetailsScreenProps) {
  const { getLastUsed, setLastUsed } = useProfiles()
  const [budget, setBudget] = useState<number>(50)
  const [useCustom, setUseCustom] = useState<boolean>(false)
  const [customBudget, setCustomBudget] = useState<string>('50')
  const sliderRef = useRef<HTMLInputElement | null>(null)
  const [occasion, setOccasion] = useState<string | undefined>(undefined)
  const [vibes, setVibes] = useState<string[]>([])
  const [dislikes, setDislikes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [showToast, setShowToast] = useState<string | null>(null)
  const [moreOpen, setMoreOpen] = useState<boolean>(false)

  useEffect(() => {
    getLastUsed().then((last) => {
      if (last?.budget) setBudget(last.budget)
      if (last?.occasion) setOccasion(last.occasion)
      if (last?.vibes) setVibes(last.vibes)
    })
  }, [getLastUsed])

  const handleBudgetSelect = (value: number | 'custom') => {
    if (value === 'custom') {
      setUseCustom(true)
    } else {
      setUseCustom(false)
      setBudget(value)
      console.info('ui_budget_set', { value })
    }
  }

  const parsedCustom = useMemo(() => {
    const n = Number(customBudget.replace(/[^0-9]/g, ''))
    return Number.isFinite(n) ? n : 50
  }, [customBudget])

  useEffect(() => {
    if (useCustom) setBudget(parsedCustom)
  }, [useCustom, parsedCustom])

  const toggleVibe = (v: string) => {
    setVibes((prev) => {
      const has = prev.includes(v)
      if (has) return prev.filter(x => x !== v)
      if (prev.length >= 3) return prev
      const next = [...prev, v]
      console.info('ui_vibes_set', { vibes: next })
      return next
    })
  }

  const onSubmit = async () => {
    if (!(budget >= 10 && budget <= 300)) {
      setShowToast('Pick a budget between $10–$300.')
      return
    }
    const intent: GachaIntent = {
      profileId: profile.id,
      budget,
      occasion,
      vibes,
      dislikes: dislikes.length ? dislikes : undefined,
      colors: colors.length ? colors : undefined,
    }
    await setLastUsed({ profileId: profile.id, budget, occasion, vibes })
    console.info('ui_spin_pressed', intent)
    onSpin(intent)
  }

  return (
    <div className="pt-4 pb-6 px-4 safe-area-inset-bottom">
      <h2 className="text-lg font-semibold mb-4">Budget & vibe</h2>
      <div className="space-y-4">
        <Card>
          <div className="mb-2 text-sm font-medium">Budget</div>
          <div className="flex flex-wrap gap-2">
            {BUDGET_PRESETS.map((b) => (
              <Chip key={b} className={`${!useCustom && budget === b ? 'bg-blue-600 text-white' : ''}`} aria-pressed={!useCustom && budget === b} onClick={() => handleBudgetSelect(b)}>{`$${b}`}</Chip>
            ))}
            <Chip className={`${useCustom ? 'bg-blue-600 text-white' : ''}`} aria-pressed={useCustom} onClick={() => handleBudgetSelect('custom')}>Custom</Chip>
          </div>
          {useCustom && (
            <div className="mt-3">
              <label className="text-sm">Custom amount</label>
              <Input className="mt-1 w-28" prefix="$" type="number" inputMode="numeric" value={customBudget} onChange={(e: any) => setCustomBudget(e.target.value)} min={10} max={300} step={5} />
              <div className="mt-3">
                <div className="relative">
                  <input
                    ref={sliderRef}
                    aria-label="Budget"
                    type="range"
                    min={10}
                    max={300}
                    step={5}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full">
                    ${budget}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">Target: ${budget}</div>
            </div>
          )}
          {!useCustom && (
            <div className="text-xs text-gray-600 mt-2">Target: ${budget}</div>
          )}
        </Card>

        <Card>
          <div className="mb-2 text-sm font-medium">Occasion</div>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <Chip key={o} className={`${occasion === o ? 'bg-blue-600 text-white' : ''}`} aria-pressed={occasion === o} onClick={() => { setOccasion(o); console.info('ui_occasion_set', { occasion: o }) }}>{o}</Chip>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-2 text-sm font-medium">Vibe</div>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <Chip key={v} className={`${vibes.includes(v) ? 'bg-blue-600 text-white' : ''}`} aria-pressed={vibes.includes(v)} onClick={() => toggleVibe(v)}>{v}</Chip>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600">Up to 3</div>
        </Card>

        <details className="rounded-2xl shadow-sm p-3 bg-white">
          <summary className="text-sm font-medium cursor-pointer">More options</summary>
          <div className="mt-3 space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">Dislikes</div>
              <div className="flex flex-wrap gap-2">
                {['scented','clutter','perfume','spicy','loud'].map(tag => (
                  <Chip key={tag} aria-pressed={dislikes.includes(tag)} onClick={() => setDislikes(d => d.includes(tag) ? d.filter(x=>x!==tag) : [...d, tag])}>{tag}</Chip>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Colors</div>
              <div className="flex gap-2">
                {['#111827','#DC2626','#059669','#2563EB','#F59E0B','#EC4899'].map(c => (
                  <button
                    key={c}
                    aria-pressed={colors.includes(c)}
                    onClick={() => setColors(cs => cs.includes(c) ? cs.filter(x=>x!==c) : [...cs, c])}
                    className="w-7 h-7 rounded-full"
                    style={{ backgroundColor: c, outline: colors.includes(c) ? '2px solid #111' : 'none' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </details>

        <div className="space-y-2">
          <Button className="w-full bg-blue-600 text-white" onClick={onSubmit}>Spin Gifts</Button>
          <button className="text-center w-full text-sm text-gray-600" onClick={onRefine}>Refine after results</button>
        </div>
      </div>

      {showToast && (
        <Toast open onOpenChange={() => setShowToast(null)}>{showToast}</Toast>
      )}
    </div>
  )
}

