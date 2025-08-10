import React from 'react'
import { Card as MinisCard } from '../../ui/Playground'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'button'
  pressed?: boolean
}

export function GlassCard({ as = 'div', className = '', pressed, ...rest }: Props) {
  const scale = pressed ? 'active:scale-[0.98]' : 'active:scale-[0.98]'
  if (as === 'button') {
    return (
      <button
        className={[
          'backdrop-blur-xl border',
          'bg-white/60 dark:bg-white/10',
          'border-white/30 dark:border-white/10',
          'shadow-lg rounded-3xl',
          'transition-transform',
          scale,
          className,
        ].join(' ')}
        {...(rest as any)}
      />
    )
  }
  return (
    <MinisCard
      className={[
        'backdrop-blur-xl border',
        'bg-white/60 dark:bg-white/10',
        'border-white/30 dark:border-white/10',
        'shadow-lg rounded-3xl',
        'transition-transform',
        scale,
        className,
      ].join(' ')}
      {...rest as any}
    />
  )
}

export default GlassCard


