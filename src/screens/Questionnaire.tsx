import React, { useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import GradientButton from '../components/ui/GradientButton'
import SelectableChip from '../components/ui/SelectableChip'
import { Input as MinisInput } from '../ui/Playground'
import { buildFalRequest } from '../services/falPayload'
import { callFal } from '../services/falClient'

type Props = {
  profileId?: string
  onBack: () => void
}

const INTERESTS = ['tech','travel','reading','cooking','gardening','fitness','music','fashion','gaming','home','art']
const OCCASIONS = ['birthday','anniversary','thank you','holiday','just because']

export default function Questionnaire({ profileId, onBack }: Props) {
  const [budget, setBudget] = useState<string>('50')
  const [occasion, setOccasion] = useState<string | undefined>(undefined)
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<string>('')

  const toggle = (v: string) => setInterests(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const onSubmit = async () => {
    const budgetNum = Number(budget.replace(/[^0-9]/g, '')) || 50
    const intent = {
      profileId: profileId || 'new_profile',
      budget: budgetNum,
      occasion,
      vibes: interests,
    }
    const payload = buildFalRequest(intent as any)
    setLoading(true)
    try {
      const res = await callFal(payload)
      setOutput(res)
    } catch (e: any) {
      setOutput(`{"error":"${e?.message || 'Fal call failed'}"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 dark:from-neutral-900 dark:to-neutral-950" aria-hidden />
      <div className="relative pt-16 pb-8 px-4 max-w-xl mx-auto">
        <div className="mb-4">
          <button className="text-sm text-blue-600" onClick={onBack}>Back</button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Quick setup</h1>
          <p className="text-sm text-gray-600 mt-1">Budget, occasion, and interests — that’s it</p>
        </div>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">Budget</div>
          <div className="w-44">
            <MinisInput prefix="$" type="number" inputMode="numeric" value={budget} onChange={(e: any) => setBudget(e.target.value)} min={5} max={500} step={5} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">Occasion</div>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(o => (
              <SelectableChip key={o} label={o} selected={occasion === o} onToggle={() => setOccasion(occasion === o ? undefined : o)} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">Interests</div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <SelectableChip key={i} label={i} selected={interests.includes(i)} onToggle={() => toggle(i)} />
            ))}
          </div>
        </GlassCard>

        <div className="mt-6">
          <GradientButton fullWidth disabled={loading} onClick={onSubmit}>{loading ? 'Generating…' : 'Generate search JSON'}</GradientButton>
        </div>

        {output && (
          <GlassCard className="p-4 mt-6">
            <div className="text-sm font-semibold mb-2">LLM JSON Output</div>
            <pre className="text-xs whitespace-pre-wrap break-all">{output}</pre>
          </GlassCard>
        )}
      </div>
    </div>
  )
}


