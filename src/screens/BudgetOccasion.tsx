import React, { useMemo, useRef, useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import GradientButton from '../components/ui/GradientButton'
import SelectableChip from '../components/ui/SelectableChip'
import { Input as MinisInput } from '../ui/Playground'

type Props = {
  profileId?: string
  onBack: () => void
  onContinue: (payload: { budget: number; occasion: string | undefined; note?: string }) => void
}

const BUDGET_PRESETS = [25, 50, 75, 100]
const OCCASIONS = ['birthday', 'anniversary', 'thank you', 'just because', 'holiday', 'graduation']

export function BudgetOccasion({ profileId, onBack, onContinue }: Props) {
  const [budget, setBudget] = useState<number>(50)
  const [useCustom, setUseCustom] = useState<boolean>(false)
  const [customBudget, setCustomBudget] = useState<string>('50')
  const [occasion, setOccasion] = useState<string | undefined>(undefined)
  const [note, setNote] = useState<string>('')
  const sliderRef = useRef<HTMLInputElement | null>(null)

  const parsedCustom = useMemo(() => {
    const n = Number(customBudget.replace(/[^0-9]/g, ''))
    return Number.isFinite(n) ? n : 50
  }, [customBudget])

  const handleBudgetSelect = (value: number | 'custom') => {
    if (value === 'custom') {
      setUseCustom(true)
    } else {
      setUseCustom(false)
      setBudget(value)
    }
  }

  const canContinue = budget >= 5 && budget <= 500

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 dark:from-neutral-900 dark:to-neutral-950" aria-hidden />
      <div className="relative pt-16 pb-8 px-4 max-w-xl mx-auto">
        <div className="mb-4">
          <button className="text-sm text-blue-600" onClick={onBack}>Back</button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Set budget & occasion</h1>
          <p className="text-sm text-gray-600 mt-1">We’ll tailor results for this profile{profileId ? ` (${profileId})` : ''}</p>
        </div>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">Budget</div>
          <div className="flex flex-wrap gap-2">
            {BUDGET_PRESETS.map((b) => (
              <SelectableChip key={b} label={`$${b}`} selected={!useCustom && budget === b} onToggle={() => handleBudgetSelect(b)} />
            ))}
            <SelectableChip label="Custom" selected={useCustom} onToggle={() => handleBudgetSelect('custom')} />
          </div>
          {useCustom && (
            <div className="mt-3">
              <label className="text-sm" htmlFor="custom-budget">Custom amount</label>
              <div className="mt-1 w-36">
                <MinisInput id="custom-budget" prefix="$" type="number" inputMode="numeric" value={customBudget} onChange={(e: any) => setCustomBudget(e.target.value)} min={5} max={500} step={5} />
              </div>
              <div className="mt-3">
                <div className="relative">
                  <input
                    ref={sliderRef}
                    aria-label="Budget"
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={parsedCustom}
                    onChange={(e) => setCustomBudget(String(e.target.value))}
                    className="w-full"
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full">
                    ${parsedCustom}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">Target: ${parsedCustom}</div>
            </div>
          )}
          {!useCustom && (
            <div className="text-xs text-gray-600 mt-2">Target: ${budget}</div>
          )}
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">Occasion</div>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <SelectableChip key={o} label={o} selected={occasion === o} onToggle={() => setOccasion(occasion === o ? undefined : o)} />
            ))}
          </div>
          <div className="mt-3">
            <label className="text-sm" htmlFor="note">Note (optional)</label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything specific for this gift?" className="mt-1 w-full min-h-[72px] rounded-xl border bg-white/80 p-2 text-sm" />
          </div>
        </GlassCard>

        <div className="mt-6">
          <GradientButton fullWidth disabled={!canContinue} onClick={() => onContinue({ budget: useCustom ? parsedCustom : budget, occasion, note: note || undefined })}>
            Continue
          </GradientButton>
        </div>
      </div>
    </div>
  )
}

export default BudgetOccasion


