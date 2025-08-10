declare module '@shopify/shop-minis-react' {
  // Minimal shims to keep our app compiling without type-checking the library internals
  import * as React from 'react'

  export const MinisContainer: React.FC<{ children?: React.ReactNode }>
  export const SearchProvider: React.FC<{ children?: React.ReactNode }>
  export const SearchInput: React.FC<React.ComponentProps<'input'>>
  export const Button: React.FC<React.ComponentProps<'button'>>
  export const Chip: React.FC<React.ComponentProps<'button'>>
  export const Card: React.FC<React.ComponentProps<'div'>>
  export function useProductSearch(args: any): any
}


