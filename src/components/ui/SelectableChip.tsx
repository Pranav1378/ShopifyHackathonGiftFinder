import React from 'react'
import { Chip as MinisChip } from '../../ui/Playground'

type Props = {
  label: string
  selected?: boolean
  onToggle?: () => void
}

export function SelectableChip({ label, selected, onToggle }: Props) {
  return (
    <MinisChip
      aria-pressed={!!selected}
      aria-label={label}
      onClick={onToggle}
      className={[
        'px-3 h-10 rounded-full border text-sm font-medium',
        'transition-transform active:scale-[0.98]',
        selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/80 text-gray-800 border-gray-300 hover:bg-gray-50',
      ].join(' ')}
    >
      {label}
    </MinisChip>
  )
}

export default SelectableChip


