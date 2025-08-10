import React from 'react'
import { gradientPrimary } from '../../theme/tokens'
import { Button as MinisButton } from '../../ui/Playground'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
}

export function GradientButton({ className = '', fullWidth, children, ...rest }: Props) {
  return (
    <MinisButton
      {...rest}
      className={[
        'relative inline-flex items-center justify-center',
        'h-12 px-6 rounded-full text-white font-medium',
        'bg-gradient-to-r',
        gradientPrimary,
        'shadow-lg',
        'active:scale-[0.98] transition-transform',
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </MinisButton>
  )
}

export default GradientButton


