import React from 'react'
import { pastelByIndex } from '../../theme/tokens'

type Props = {
  label: string
  initials?: string
  selected?: boolean
  colorIndex?: number
  onPress?: () => void
}

export function ProfilePill({ label, initials, selected, colorIndex = 0, onPress }: Props) {
  return (
    <button
      aria-pressed={!!selected}
      aria-label={`Profile ${label}`}
      onClick={onPress}
      className={[
        'flex flex-col items-center justify-center min-w-[80px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl',
      ].join(' ')}
    >
      <div className={[
        'w-14 h-14 rounded-full flex items-center justify-center text-sm',
        pastelByIndex(colorIndex),
        selected ? 'ring-2 ring-blue-500' : '',
      ].join(' ')}>
        <span className="font-semibold">{initials || '🙂'}</span>
      </div>
      <div className="mt-1 text-xs text-gray-700 max-w-[80px] truncate" aria-hidden>
        {label}
      </div>
    </button>
  )
}

export default ProfilePill


