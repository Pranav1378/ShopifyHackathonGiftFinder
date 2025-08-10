import React, { useMemo, useState } from 'react'
import GlassCard from '../components/ui/GlassCard'
import GradientButton from '../components/ui/GradientButton'
import SelectableChip from '../components/ui/SelectableChip'

type Props = {
  onCancel: () => void
  onDone: (answers: {
    interests: string[]
    lifestyle: string[]
    style: string[]
    colorsLike: string[]
    colorsAvoid: string[]
    materialsLike: string[]
    materialsAvoid: string[]
  }) => void
}

const GENERAL_INTERESTS = ['tech','travel','reading','cooking','gardening','fitness','music','fashion','gaming','home','art']
const LIFESTYLE = ['active','homebody','minimalist','collector']
const STYLES = ['modern','vintage','colorful','neutral','luxury','eco-friendly']
const COLORS = ['black','white','navy','green','red','gold','pastels','earth tones']
const MATERIALS = ['leather','wool','cotton','linen','synthetic','silk','cashmere']

export function ProfileCreate({ onCancel, onDone }: Props) {
  const [interests, setInterests] = useState<string[]>([])
  const [lifestyle, setLifestyle] = useState<string[]>([])
  const [style, setStyle] = useState<string[]>([])
  const [colorsLike, setColorsLike] = useState<string[]>([])
  const [colorsAvoid, setColorsAvoid] = useState<string[]>([])
  const [materialsLike, setMaterialsLike] = useState<string[]>([])
  const [materialsAvoid, setMaterialsAvoid] = useState<string[]>([])

  const toggle = (arr: string[], setter: (v: string[]) => void, v: string) => {
    setter(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])
  }

  const canSubmit = useMemo(() => {
    return (
      interests.length + lifestyle.length + style.length + colorsLike.length + materialsLike.length > 0
    )
  }, [interests, lifestyle, style, colorsLike, materialsLike])

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-emerald-50 dark:from-neutral-900 dark:to-neutral-950" aria-hidden />
      <div className="relative pt-16 pb-8 px-4 max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Tell us about them</h1>
          <p className="text-sm text-gray-600 mt-1">Optional taps to guide the AI — pick anything that always fits</p>
        </div>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">General Interests</div>
          <div className="flex flex-wrap gap-2">
            {GENERAL_INTERESTS.map(x => (
              <SelectableChip key={x} label={x} selected={interests.includes(x)} onToggle={() => toggle(interests, setInterests, x)} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">Lifestyle Markers</div>
          <div className="flex flex-wrap gap-2">
            {LIFESTYLE.map(x => (
              <SelectableChip key={x} label={x} selected={lifestyle.includes(x)} onToggle={() => toggle(lifestyle, setLifestyle, x)} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-2">Style Preferences</div>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(x => (
              <SelectableChip key={x} label={x} selected={style.includes(x)} onToggle={() => toggle(style, setStyle, x)} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-1">Color Preferences</div>
          <div className="text-xs text-gray-500 mb-2">Likes</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {COLORS.map(x => (
              <SelectableChip key={x} label={x} selected={colorsLike.includes(x)} onToggle={() => toggle(colorsLike, setColorsLike, x)} />
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-2">Avoid</div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(x => (
              <SelectableChip key={x} label={x} selected={colorsAvoid.includes(x)} onToggle={() => toggle(colorsAvoid, setColorsAvoid, x)} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <div className="text-sm font-semibold mb-1">Material Preferences</div>
          <div className="text-xs text-gray-500 mb-2">Loves</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {MATERIALS.map(x => (
              <SelectableChip key={x} label={x} selected={materialsLike.includes(x)} onToggle={() => toggle(materialsLike, setMaterialsLike, x)} />
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-2">Avoid</div>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map(x => (
              <SelectableChip key={x} label={x} selected={materialsAvoid.includes(x)} onToggle={() => toggle(materialsAvoid, setMaterialsAvoid, x)} />
            ))}
          </div>
        </GlassCard>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="h-12 rounded-full border border-gray-300" onClick={onCancel}>
            Cancel
          </button>
          <GradientButton onClick={() => onDone({ interests, lifestyle, style, colorsLike, colorsAvoid, materialsLike, materialsAvoid })}>
            Save & Continue
          </GradientButton>
        </div>
      </div>
    </div>
  )
}

export default ProfileCreate


