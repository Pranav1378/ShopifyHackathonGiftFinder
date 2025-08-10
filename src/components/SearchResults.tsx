import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useSearchProducts } from '../search/search'
import type { QuerySpec } from '../search/types'
import { incrementMany, getCount } from '../services/likeInsights'
 

// ----------------- helpers (unchanged) -----------------
export type DatasetItem = { spec: QuerySpec; budget: number | null; originalText: string; category: string }
function parseUnderPrice(text: string): { term: string; budget: number | null } {
  if (!text) return { term: '', budget: null }
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
      spec: { query: term, must, must_not: [], nice_to_have: [], categories },
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
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2 py-1 text-[11px] font-semibold">
      {currency ? `${currency} ` : '$'}{amt.toFixed(2)}
    </span>
  )
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

// ----------------- UI atoms -----------------
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-4 shadow-[0_2px_30px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  )
}
function ProductCard({ p }: { p: any }) {
  const image = p?.featuredImage?.url ?? p?.images?.[0]?.url
  return (
    <GlassCard>
      <div className="flex gap-4">
        {image ? (
          <img src={image} alt={p?.featuredImage?.altText ?? p?.title ?? ''} className="w-28 h-28 rounded-xl object-cover" />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-black/5 dark:bg-white/10" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold line-clamp-2">{p?.title ?? 'Untitled'}</div>
          {p?.vendor && <div className="mt-1 text-xs text-gray-500 line-clamp-1">{p.vendor}</div>}
          <div className="mt-2"><Price product={p} /></div>
        </div>
      </div>
    </GlassCard>
  )
}
function DotProgress({ total, index }: { total: number; index: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 w-5 rounded-full ${i <= index ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500' : 'bg-black/10 dark:bg-white/10'}`} />
      ))}
    </div>
  )
}

// ----------------- Single query results -----------------
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

  useEffect(() => {
    if ((sampled?.length ?? 0) < 3 && hasNextPage && typeof fetchMore === 'function') void fetchMore()
  }, [sampled?.length, hasNextPage, fetchMore])

  const categories = spec.categories.length > 0 ? spec.categories : ['general']
  const total = Math.max(1, sampled.length)

  // advance helper (auto after like/dislike)
  const goNext = useCallback(() => {
    setCursor((c) => {
      const atEnd = c >= sampled.length - 1
      if (atEnd) {
        if (hasNextPage && typeof fetchMore === 'function') fetchMore()
        return c // stay if no more items yet; new data will refresh
      }
      return c + 1
    })
    setLiked(null)
  }, [sampled.length, fetchMore, hasNextPage])

  const onLike = useCallback(() => {
    incrementMany(categories, 1)
    setLiked('like')
    setTimeout(goNext, 150)
  }, [categories, goNext])

  const onDislike = useCallback(() => {
    incrementMany(categories, -1)
    setLiked('dislike')
    setTimeout(goNext, 150)
  }, [categories, goNext])

  if (error) return <div className="text-sm text-red-600">{String(error.message ?? error)}</div>
  if (loading) return (
    <GlassCard>
      <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="animate-spin h-4 w-4" /> Loading…</div>
    </GlassCard>
  )
  if (!filtered || filtered.length === 0) return <div className="text-xs text-gray-500">No products found.</div>

  const p = sampled[cursor]

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={p?.id ?? cursor}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          <ProductCard p={p} />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-gray-600">Item {Math.min(cursor + 1, total)} of {total}</div>
        <DotProgress total={total} index={cursor} />
        {/* Back/Next buttons removed per request */}
        <div />
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          aria-label="Like"
          className={`w-12 h-12 rounded-full text-white shadow-md active:scale-95 bg-gradient-to-r from-indigo-600 to-fuchsia-600 ${liked === 'like' ? 'opacity-60' : ''}`}
          onClick={onLike}
        >
          <Heart className="h-5 w-5 mx-auto" />
        </button>
        <button
          aria-label="Dislike"
          className={`w-12 h-12 rounded-full text-white shadow-md active:scale-95 bg-gradient-to-r from-indigo-600 to-fuchsia-600 ${liked === 'dislike' ? 'opacity-60' : ''}`}
          onClick={onDislike}
        >
          <X className="h-5 w-5 mx-auto" />
        </button>
      </div>

      <div className="text-[10px] text-gray-500">
        {categories.map((c) => (
          <span key={c} className="mr-2">{c}: {getCount(c)}</span>
        ))}
      </div>
    </div>
  )
}

// ----------------- Whole page -----------------
export function SearchResults({ llmOutput }: { llmOutput: unknown }) {
  const dataset = useMemo(() => buildDatasetFromLlmJson(llmOutput), [llmOutput])
  const [queryIndex, setQueryIndex] = useState(0)
  useEffect(() => { setQueryIndex(0) }, [dataset.map((d) => d.spec.query).join('|')])
  if (!dataset || dataset.length === 0) return <div className="text-xs text-gray-500">No queries to run.</div>
  const current = dataset[queryIndex]
  const categories = (current.spec.categories || []).filter((c) => !!c && String(c).trim().length > 0)

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        {/* Replaces chips with a single explicit category label; removes empty pill */}
        <div className="text-xs text-gray-600">
          Category: {categories[0] ?? 'general'}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10"
            onClick={() => setQueryIndex((i) => (i - 1 + dataset.length) % dataset.length)}
          >
            <span className="inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Prev</span>
          </button>
          <button
            className="rounded-xl px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10"
            onClick={() => setQueryIndex((i) => (i + 1) % dataset.length)}
          >
            <span className="inline-flex items-center gap-1">Next <ArrowRight className="h-4 w-4" /></span>
          </button>
        </div>
      </div>

      {/* query text hidden per request */}
      {/* <div className="text-sm font-medium">{current.spec.query}</div> */}

      <SingleQueryResults spec={current.spec} budget={current.budget} />

      {/* Removed gradient “Start over with new interests” button */}
    </div>
  )
}
