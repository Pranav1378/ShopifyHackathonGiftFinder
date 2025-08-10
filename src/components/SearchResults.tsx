import { useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchProducts } from '../search/search'
import { mockShopifyProducts } from '../mocks/shopifyMockData'
import { Button, Chip } from '../ui/Playground'
import type { QuerySpec } from '../search/types'
import { incrementMany, getCount } from '../services/likeInsights'
import { TinderDeck, DeckCard as TinderCardModel } from './ui/TinderDeck'
import ErrorBoundary from './ui/ErrorBoundary'

const USE_MINIS_HOOK = true

// Parses LLM JSON like:
// { "queryone": { "text": "tech gadgets under $50 holiday", "category": "electronics" }, ... }
type DatasetItem = { spec: QuerySpec; budget: number | null; originalText: string; category: string }

function parseUnderPrice(text: string): { term: string; budget: number | null } {
  if (!text) return { term: '', budget: null }
  // Capture variations like: "under 50", "under $50", "<= $50", "under usd 50"
  const m = text.match(/^(.*?)(?:\s*(?:under|<=)\s*(?:usd\s*)?\$?\s*(\d+(?:\.\d{1,2})?)(?:\s*(?:dollars|bucks|usd)\b)?)?(.*)$/i)
  if (!m) return { term: text.trim(), budget: null }
  const left = (m[1] ?? '').trim()
  const priceStr = m[2]
  const right = (m[3] ?? '').trim()
  const term = [left, right].filter(Boolean).join(' ').trim()
  const budget = priceStr ? Number(priceStr) : null
  return { term, budget }
}

export function buildDatasetFromLlmJson(raw: unknown): DatasetItem[] {
  if (!raw || typeof raw !== 'object') return []
  const entries = Object.values(raw as Record<string, any>)
  const dataset: DatasetItem[] = []
  for (const item of entries) {
    if (!item || typeof item !== 'object') continue
    const text = String(item.text ?? '').trim()
    const category = item.category ? String(item.category) : ''
    if (!text) continue
    const { term, budget } = parseUnderPrice(text)
    const must: string[] = [term]
    const categories: string[] = category ? [category] : []
    dataset.push({
      spec: {
        query: term,
        must,
        must_not: [],
        nice_to_have: [],
        categories,
      },
      budget,
      originalText: text,
      category,
    })
  }
  return dataset
}

// Price display is now handled inside the TinderDeck card rendering via getDisplayPrice

function getVariantNodes(product: any): any[] {
  const nodes = product?.variants?.nodes
  if (Array.isArray(nodes)) return nodes
  if (Array.isArray(product?.variants)) return product.variants
  return []
}

function isVariantPurchasable(variant: any): boolean {
  const flags = [
    Boolean(variant?.availableForSale),
    Boolean(variant?.available),
    Boolean(variant?.inStock),
    Number(variant?.quantityAvailable) > 0,
  ]
  return flags.some(Boolean)
}

function readVariantPrice(variant: any): { amount: number | null; currency: string | null } {
  const v2Amt = Number(variant?.priceV2?.amount)
  const v2Cur = variant?.priceV2?.currencyCode ?? null
  if (!Number.isNaN(v2Amt)) return { amount: v2Amt, currency: v2Cur }
  const amt = Number(variant?.price?.amount)
  const cur = variant?.price?.currencyCode ?? null
  if (!Number.isNaN(amt)) return { amount: amt, currency: cur }
  return { amount: null, currency: null }
}

function getMinPurchasableVariantPrice(product: any, budgetCurrency: string | null): { amount: number | null; currency: string | null } {
  const variants = getVariantNodes(product)
  const purchasable = variants.filter(isVariantPurchasable)
  const candidatePrices = purchasable
    .map(readVariantPrice)
    .filter((p) => p.amount != null && Number.isFinite(p.amount as number)) as { amount: number; currency: string | null }[]

  const inBudgetCurrency = budgetCurrency
    ? candidatePrices.filter((p) => (p.currency ?? budgetCurrency) === budgetCurrency)
    : candidatePrices

  const pickMin = (arr: { amount: number; currency: string | null }[]) =>
    arr.reduce<{ amount: number; currency: string | null } | null>((acc, cur) => {
      if (!acc || cur.amount < acc.amount) return cur
      return acc
    }, null)

  let chosen = pickMin(inBudgetCurrency)

  if (!chosen) {
    // Fallback to minVariantPrice from priceRange if available and currency matches (if specified)
    const rangeAmt = Number(product?.priceRange?.minVariantPrice?.amount)
    const rangeCur = product?.priceRange?.minVariantPrice?.currencyCode ?? null
    const okCurrency = budgetCurrency ? (rangeCur ?? budgetCurrency) === budgetCurrency : true
    if (!Number.isNaN(rangeAmt) && okCurrency) {
      chosen = { amount: rangeAmt, currency: rangeCur }
    }
  }

  return chosen ?? { amount: null, currency: null }
}

function getDisplayPrice(product: any): { amount: number | null; currency: string | null } {
  // Display price should always show something if possible, independent of budget currency
  const variants = getVariantNodes(product)
  const purchasable = variants.filter(isVariantPurchasable)
  const candidatePrices = (purchasable.length > 0 ? purchasable : variants)
    .map(readVariantPrice)
    .filter((p) => p.amount != null && Number.isFinite(p.amount as number)) as { amount: number; currency: string | null }[]

  if (candidatePrices.length > 0) {
    const min = candidatePrices.reduce((acc, cur) => (!acc || cur.amount < acc.amount ? cur : acc))
    return min
  }
  const rangeAmt = Number(product?.priceRange?.minVariantPrice?.amount)
  const rangeCur = product?.priceRange?.minVariantPrice?.currencyCode ?? null
  if (!Number.isNaN(rangeAmt)) return { amount: rangeAmt, currency: rangeCur }
  const productAmt = Number(product?.price?.amount)
  const productCur = product?.price?.currencyCode ?? null
  if (!Number.isNaN(productAmt)) return { amount: productAmt, currency: productCur }
  const variantAmt = Number(product?.selectedVariant?.price?.amount)
  const variantCur = product?.selectedVariant?.price?.currencyCode ?? null
  if (!Number.isNaN(variantAmt)) return { amount: variantAmt, currency: variantCur }
  return { amount: null, currency: null }
}

function sample<T>(arr: T[], count: number): T[] {
  if (!arr || arr.length <= count) return arr ?? []
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

function SingleQueryResultsMinis({ spec, budget }: { spec: QuerySpec; budget: number | null }) {
  const { products, loading, error, hasNextPage, fetchMore } = useSearchProducts({ dataset: [spec] })
  const budgetCurrencyCode: string | null = 'USD'
  const filtered = useMemo(() => {
    const list = products ?? []
    if (budget == null) return list
    return list.filter((p: any) => {
      const { amount, currency } = getMinPurchasableVariantPrice(p, budgetCurrencyCode)
      if (amount == null) return false
      if (budgetCurrencyCode && currency && currency !== budgetCurrencyCode) return false
      return amount <= budget
    })
  }, [products, budget])

  const [sampled, setSampled] = useState<any[]>([])
  useEffect(() => {
    const desired = Math.min(3, filtered.length)
    setSampled(sample(filtered, desired))
  }, [filtered])

  // Ensure we end up with 3 items if possible by paging more
  useEffect(() => {
    if ((sampled?.length ?? 0) < 3 && hasNextPage && typeof fetchMore === 'function') {
      void fetchMore()
    }
  }, [sampled?.length, hasNextPage, fetchMore])

  const categories = spec.categories.length > 0 ? spec.categories : ['general']
  const onLike = useCallback(() => {
    incrementMany(categories, 1)
  }, [categories])
  const onDislike = useCallback(() => {
    incrementMany(categories, -1)
  }, [categories])

  // Fallback to mock data if hook errors
  const effectiveProducts = error ? mockShopifyProducts : filtered
  if (loading && !error) return <div className="text-sm text-gray-500">Loading…</div>
  if (!effectiveProducts || effectiveProducts.length === 0) return <div className="text-xs text-gray-500">No products found.</div>
  const toDeckCards: TinderCardModel[] = useMemo(() => {
    const source = error ? sample(mockShopifyProducts as any[], 3) : sampled
    return source.map((p: any) => {
      const { amount, currency } = getDisplayPrice(p)
      const image = p?.featuredImage?.url ?? p?.images?.[0]?.url
      const priceLabel = amount != null && Number.isFinite(amount) ? `${currency ? `${currency} ` : '$'}${amount.toFixed(2)}` : ''
      return {
        id: String(p?.id ?? Math.random()),
        title: String(p?.title ?? 'Untitled'),
        priceLabel,
        imageUrl: String(image ?? ''),
      }
    })
  }, [sampled])
  return (
    <div className="space-y-3">
      <TinderDeck
        cards={toDeckCards}
        onSwipeRight={() => {
          console.log('Swiped right!');
          onLike();
        }}
        onSwipeLeft={() => {
          console.log('Swiped left!');
          onDislike();
        }}
        onEnd={() => { 
          console.log('Deck finished!');
        }}
      />
      <div className="text-[10px] text-gray-500">
        {categories.map((c) => (
          <span key={c} className="mr-2">{c}: {getCount(c)}</span>
        ))}
      </div>
    </div>
  )
}

function SingleQueryResultsMock({ spec, budget }: { spec: QuerySpec; budget: number | null }) {
  const budgetCurrencyCode: string | null = 'USD'
  const filtered = useMemo(() => {
    const list = mockShopifyProducts as any[]
    if (budget == null) return list
    return list.filter((p: any) => {
      const { amount, currency } = getMinPurchasableVariantPrice(p, budgetCurrencyCode)
      if (amount == null) return false
      if (budgetCurrencyCode && currency && currency !== budgetCurrencyCode) return false
      return amount <= budget
    })
  }, [budget])

  const [sampled, setSampled] = useState<any[]>([])
  useEffect(() => {
    const desired = Math.min(3, filtered.length)
    setSampled(sample(filtered, desired))
  }, [filtered])

  const categories = spec.categories.length > 0 ? spec.categories : ['general']
  const onLike = useCallback(() => {
    incrementMany(categories, 1)
  }, [categories])
  const onDislike = useCallback(() => {
    incrementMany(categories, -1)
  }, [categories])

  if (!filtered || filtered.length === 0) return <div className="text-xs text-gray-500">No products found.</div>
  const toDeckCards: TinderCardModel[] = useMemo(() => {
    return sampled.map((p: any) => {
      const { amount, currency } = getDisplayPrice(p)
      const image = p?.featuredImage?.url ?? p?.images?.[0]?.url
      const priceLabel = amount != null && Number.isFinite(amount) ? `${currency ? `${currency} ` : '$'}${amount.toFixed(2)}` : ''
      return {
        id: String(p?.id ?? Math.random()),
        title: String(p?.title ?? 'Untitled'),
        priceLabel,
        imageUrl: String(image ?? ''),
      }
    })
  }, [sampled])

  return (
    <div className="space-y-3">
      <TinderDeck
        cards={toDeckCards}
        onSwipeRight={() => {
          console.log('Swiped right!');
          onLike();
        }}
        onSwipeLeft={() => {
          console.log('Swiped left!');
          onDislike();
        }}
        onEnd={() => { 
          console.log('Deck finished!');
        }}
      />
      <div className="text-[10px] text-gray-500">
        {categories.map((c) => (
          <span key={c} className="mr-2">{c}: {getCount(c)}</span>
        ))}
      </div>
    </div>
  )
}

export function SearchResults({ llmOutput }: { llmOutput: unknown }) {
  const dataset = useMemo(() => buildDatasetFromLlmJson(llmOutput), [llmOutput])
  const [queryIndex, setQueryIndex] = useState(0)

  useEffect(() => {
    setQueryIndex(0)
  }, [dataset.map(d => d.spec.query).join('|')])

  if (!dataset || dataset.length === 0) {
    return <div className="text-xs text-gray-500">No queries to run.</div>
  }
  const current = dataset[queryIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1 items-center">
          {current.spec.categories.map((c) => (
            <Chip key={c} className="h-7 px-2 text-xs">{c}</Chip>
          ))}
          <Chip className="h-7 px-2 text-xs bg-gray-800 text-white">{current.budget != null ? `≤ $${current.budget}` : 'All prices'}</Chip>
        </div>
        <div className="flex gap-2">
          <Button className="px-3" onClick={() => setQueryIndex((i) => (i - 1 + dataset.length) % dataset.length)}>Prev query</Button>
          <Button className="px-3" onClick={() => setQueryIndex((i) => (i + 1) % dataset.length)}>Next query</Button>
        </div>
      </div>
      <div className="text-sm font-medium">{current.spec.query}</div>
      {USE_MINIS_HOOK ? (
        <ErrorBoundary fallback={<SingleQueryResultsMock spec={current.spec} budget={current.budget} />}>
          <SingleQueryResultsMinis spec={current.spec} budget={current.budget} />
        </ErrorBoundary>
      ) : (
        <SingleQueryResultsMock spec={current.spec} budget={current.budget} />
      )}
    </div>
  )
}

