export interface QuerySpec {
  query: string
  must: string[]
  must_not: string[]
  nice_to_have: string[]
  categories: string[]
}

export interface FormattedProductImage {
  url: string
  altText?: string | null
}

export interface FormattedProductPrice {
  amount: number | null
  currencyCode?: string | null
}

export interface FormattedProduct {
  id: string
  title: string
  images: FormattedProductImage[]
  price: FormattedProductPrice
  matched: {
    categories: string[]
    terms: string[]
    tags: string[]
  }
}

export interface BuiltSearchQuery {
  queryString: string
  // Placeholder for future typed filters if exposed by the SDK
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: any
}


