import { useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchProducts } from '../search/search'
import { Card, Button, Chip } from '../ui/Playground'
import type { QuerySpec } from '../search/types'
import { incrementMany, getCount } from '../services/likeInsights'

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

function Price({ product }: { product: any }) {
  const amt = Number(product?.selectedVariant?.price?.amount ?? product?.price?.amount)
  const currency = product?.selectedVariant?.price?.currencyCode ?? product?.price?.currencyCode
  if (!Number.isFinite(amt)) return <span className="text-xs text-gray-500">—</span>
  return <span className="text-sm font-medium">{currency ? `${currency} ` : '$'}{amt.toFixed(2)}</span>
}

function getMinPrice(p: any): number | null {
  const variantAmt = Number(p?.selectedVariant?.price?.amount)
  if (!Number.isNaN(variantAmt)) return variantAmt
  const productAmt = Number(p?.price?.amount)
  return Number.isNaN(productAmt) ? null : productAmt
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

function SingleQueryResults({ spec, budget }: { spec: QuerySpec; budget: number | null }) {
  const { products, loading, error, hasNextPage, fetchMore } = useSearchProducts({ dataset: [spec] })
  const filtered = useMemo(() => {
    const list = products ?? []
    if (budget == null) return list
    return list.filter((p: any) => {
      const amt = getMinPrice(p)
      return amt != null && amt <= budget
    })
  }, [products, budget])

  const [sampled, setSampled] = useState<any[]>([])
  const [cursor, setCursor] = useState(0)
  const [liked, setLiked] = useState<'like' | 'dislike' | null>(null)
  useEffect(() => {
    const desired = Math.min(3, filtered.length)
    setSampled(sample(filtered, desired))
    setCursor(0)
    setLiked(null)
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
    setLiked('like')
  }, [categories])
  const onDislike = useCallback(() => {
    incrementMany(categories, -1)
    setLiked('dislike')
  }, [categories])

  if (error) return <div className="text-sm text-red-600">{String(error.message ?? error)}</div>
  if (loading) return <div className="text-sm text-gray-500">Loading…</div>
  if (!filtered || filtered.length === 0) return <div className="text-xs text-gray-500">No products found.</div>
  const p = sampled[cursor]
  const image = p?.featuredImage?.url ?? p?.images?.[0]?.url
  return (
    <div className="space-y-3">
      <Card>
        <div className="flex gap-3">
          {image ? (
            <img src={image} alt={p?.featuredImage?.altText ?? p?.title ?? ''} className="w-24 h-24 rounded-md object-cover flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-md bg-gray-100 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium line-clamp-2">{p?.title ?? 'Untitled'}</div>
            <div className="mt-1 text-xs text-gray-500 line-clamp-2">{p?.vendor ?? ''}</div>
            <div className="mt-2"><Price product={p} /></div>
          </div>
        </div>
      </Card>
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-gray-600">Item {Math.min(cursor + 1, sampled.length)} of {Math.max(1, sampled.length)}</div>
        <div className="flex gap-2">
          <Button className="px-3" onClick={() => setCursor((c) => Math.max(0, c - 1))} disabled={cursor === 0}>Back</Button>
          <Button className="px-3" onClick={() => setCursor((c) => Math.min(sampled.length - 1, c + 1))} disabled={cursor >= sampled.length - 1}>Next</Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button className={`flex-1 ${liked === 'like' ? 'opacity-60' : ''}`} onClick={onLike}>Like</Button>
        <Button className={`flex-1 ${liked === 'dislike' ? 'opacity-60' : ''}`} onClick={onDislike}>Dislike</Button>
      </div>
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
      <SingleQueryResults spec={current.spec} budget={current.budget} />
    </div>
  )
}


