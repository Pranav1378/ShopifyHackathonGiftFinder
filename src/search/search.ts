import type {BuiltSearchQuery, FormattedProduct, QuerySpec} from './types'
import { useProductSearch } from '@shopify/shop-minis-react'

// Build Shopify-compatible product search query string
export function buildProductSearchQuery(spec: QuerySpec): BuiltSearchQuery {
  if (!spec || typeof (spec as any).query !== 'string') {
    throw new Error('Invalid query spec')
  }

  const q = sanitizeTerm(spec.query)
  const categories = (spec.categories ?? []).map((t) => sanitizeTerm(t)).filter(Boolean)
  const queryString = [q, ...categories].filter(Boolean).join(' ').trim()
  return { queryString }
}

function sanitizeTerm(term: string): string {
  return String(term ?? '').trim().replace(/\s+/g, ' ')
}

function wrapWildcards(term: string): string {
  const t = escapeQuotes(term)
  return `*${t}*`
}

function escapeQuotes(s: string): string {
  return String(s ?? '').replaceAll('"', '\\"')
}

function parseUnderPrice(term: string): number | null {
  const m = String(term ?? '').match(/under\s*\$?\s*(\d+(?:\.\d{1,2})?)/i)
  return m ? Number(m[1]) : null
}

// Result formatting helpers for the SDK's product shape
export function formatProductsForDisplay(products: any[], spec: QuerySpec): FormattedProduct[] {
  const lcTerms = new Set(
    [
      ...(spec.must ?? []),
      ...(spec.nice_to_have ?? []),
      ...(spec.categories ?? []),
    ].map((t) => String(t).toLowerCase())
  )

  return (products ?? []).map((p) => {
    const title: string = p?.title ?? ''
    const tags: string[] = Array.isArray(p?.tags) ? p.tags : []
    const productType: string | undefined = p?.productType

    const images = [p?.featuredImage, ...(p?.images ?? [])]
      .filter(Boolean)
      .map((img: any) => ({ url: img.url as string, altText: img.altText ?? null }))

    const price = p?.price ?? p?.priceRange?.minVariantPrice ?? null
    let amount: number | null = null
    try {
      const rawAmt = (p?.selectedVariant?.price?.amount ?? price?.amount) as any
      amount = rawAmt != null && !Number.isNaN(Number(rawAmt)) ? Number(rawAmt) : null
    } catch {
      amount = null
    }
    const currencyCode: string | null = (p?.selectedVariant?.price?.currencyCode ?? price?.currencyCode) ?? null

    const haystack = [title, ...(tags ?? []), productType ?? '']
      .join(' ')
      .toLowerCase()

    const matchedTerms = Array.from(lcTerms).filter((t) => haystack.includes(t))
    const matchedCategories = (productType ? [productType] : []).filter((c) => lcTerms.has(c.toLowerCase()))
    const matchedTags = (tags ?? []).filter((tg) => lcTerms.has(String(tg).toLowerCase()))

    return {
      id: String(p?.id ?? ''),
      title,
      images,
      price: { amount, currencyCode },
      matched: {
        categories: matchedCategories,
        terms: matchedTerms,
        tags: matchedTags,
      },
    }
  })
}

export interface SearchProductsOptions {
  dataset: QuerySpec[]
  index?: number
  byQuery?: string // pick by the query field value
}

export interface SearchProductsResult {
  // Raw SDK products. Use ProductCard to render directly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[] | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Hook-style method leveraging the Minis SDK product search
export function useSearchProducts(options: SearchProductsOptions): SearchProductsResult {
  const {dataset, index, byQuery} = options
  const resolvedIndex = resolveIndex(dataset, index, byQuery)
  const spec = resolvedIndex >= 0 ? dataset?.[resolvedIndex] : undefined
  const built: BuiltSearchQuery = spec ? buildProductSearchQuery(spec) : {queryString: ''}

  const {products, loading, error, refetch} = useProductSearch({
    query: built.queryString,
    includeSensitive: false,
    skip: !built.queryString,
  })

  return {
    // return raw products for direct consumption by ProductCard
    products: (products as any[]) ?? null,
    loading,
    error: (error as Error) ?? null,
    refetch: async () => {
      await refetch()
    },
  }
}

// Generic executor signature compatible with Minis SDK getProductSearch
export type ProductSearchExecutor = (params: {
  query: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortBy?: any
  includeSensitive?: boolean
}) => Promise<{
  ok: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { data: any[]; pageInfo?: any }
  error?: Error
}>

// Non-hook utility: build query, execute search via provided executor, and format results
export async function searchProducts(spec: QuerySpec, exec: ProductSearchExecutor): Promise<FormattedProduct[]> {
  if (!spec) throw new Error('Query spec is required')
  const built = buildProductSearchQuery(spec)
  if (!built.queryString) return []
  const res = await exec({ query: built.queryString, includeSensitive: false })
  if (!res.ok) throw res.error ?? new Error('Search failed')
  const raw = res.data?.data ?? []
  return formatProductsForDisplay(raw, spec)
}

function resolveIndex(dataset: QuerySpec[], index?: number, byQuery?: string): number {
  if (!dataset || dataset.length === 0) return -1
  if (typeof index === 'number' && index >= 0 && index < dataset.length) return index
  if (byQuery) {
    const found = dataset.findIndex((q) => q.query?.toLowerCase() === byQuery.toLowerCase())
    if (found >= 0) return found
  }
  return 0
}


