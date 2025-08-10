import React from 'react'
import * as Minis from '@shopify/shop-minis-react'

type AnyProps = Record<string, any>

export const Button: React.FC<AnyProps> = ({ className = '', children, ...rest }) => {
  const Cmp: any = (Minis as any).Button
  if (Cmp) return <Cmp className={className} {...rest}>{children}</Cmp>
  return (
    <button className={`rounded-full h-12 px-4 ${className}`} {...rest}>{children}</button>
  )
}

export const Chip: React.FC<AnyProps> = ({ className = '', children, ...rest }) => {
  const Cmp: any = (Minis as any).Chip
  if (Cmp) return <Cmp className={className} {...rest}>{children}</Cmp>
  return (
    <button
      className={`px-3 h-10 rounded-full border bg-white active:scale-95 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export const Card: React.FC<AnyProps> = ({ className = '', children, ...rest }) => {
  const Cmp: any = (Minis as any).Card
  if (Cmp) return <Cmp className={className} {...rest}>{children}</Cmp>
  return (
    <div className={`rounded-2xl shadow-sm p-3 bg-white border ${className}`} {...rest}>{children}</div>
  )
}

export const Input: React.FC<AnyProps> = ({ className = '', prefix, ...rest }) => {
  const Cmp: any = (Minis as any).Input
  if (Cmp) return <Cmp className={className} prefix={prefix} {...rest} />
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {prefix ? <span className="text-gray-600">{prefix}</span> : null}
      <input className="border rounded-md px-2 py-2 w-full" {...rest} />
    </div>
  )
}

export const Toast: React.FC<AnyProps> = ({ className = '', children, open = true, onOpenChange }) => {
  const Cmp: any = (Minis as any).Toast
  if (Cmp) return <Cmp className={className} open={open} onOpenChange={onOpenChange}>{children}</Cmp>
  if (!open) return null
  return (
    <div role="status" onClick={() => onOpenChange?.(false)} className={`fixed bottom-6 inset-x-0 mx-auto w-max bg-gray-900 text-white px-3 py-2 rounded-full text-sm ${className}`}>{children}</div>
  )
}

