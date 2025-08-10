import React, { useMemo } from 'react'
import { useSearchProducts } from '../search/search'
import { Card } from '../ui/Playground'
import type { QuerySpec } from '../search/types'

// Parses LLM JSON like:
// { "queryone": { "text": "tech gadgets under $50 holiday", "category": "electronics" }, ... }
export function buildDatasetFromLlmJson(raw: unknown): QuerySpec[] {
  if (!raw || typeof raw !== 'object') return []
  const entries = Object.values(raw as Record<string, any>)
  const dataset: QuerySpec[] = []
  for (const item of entries) {
    if (!item || typeof item !== 'object') continue
    const text = String(item.text ?? '').trim()
    const category = item.category ? String(item.category) : ''
    if (!text) continue
    const must: string[] = [text]
    const categories: string[] = category ? [category] : []
    dataset.push({
      query: text,
      must,
      must_not: [],
      nice_to_have: [],
      categories,
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

function SingleQueryResults({ spec }: { spec: QuerySpec }) {
  const { products, loading, error } = useSearchProducts({ dataset: [spec] })
  if (error) return <div className="text-sm text-red-600">{String(error.message ?? error)}</div>
  if (loading) return <div className="text-sm text-gray-500">Loading…</div>
  if (!products || products.length === 0) return <div className="text-xs text-gray-500">No products found.</div>
  return (
    <div className="grid grid-cols-1 gap-3">
      {products.map((p: any) => {
        const image = p?.featuredImage?.url ?? p?.images?.[0]?.url
        return (
          <Card key={String(p?.id)}>
            <div className="flex gap-3">
              {image ? (
                <img src={image} alt={p?.featuredImage?.altText ?? p?.title ?? ''} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-md bg-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-2">{p?.title ?? 'Untitled'}</div>
                <div className="mt-1 text-xs text-gray-500 line-clamp-2">{p?.vendor ?? ''}</div>
                <div className="mt-2"><Price product={p} /></div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function SearchResults({ llmOutput }: { llmOutput: unknown }) {
  const dataset = useMemo(() => buildDatasetFromLlmJson(llmOutput), [llmOutput])
  if (!dataset || dataset.length === 0) {
    return <div className="text-xs text-gray-500">No queries to run.</div>
  }
  return (
    <div className="space-y-6">
      {dataset.map((spec, idx) => (
        <div key={`${spec.query}-${idx}`}>
          <div className="mb-2 text-[11px] text-gray-600">
            <span className="font-semibold">Query:</span> {spec.query}
            {spec.categories.length > 0 && (
              <span> · <span className="font-semibold">Category:</span> {spec.categories.join(', ')}</span>
            )}
          </div>
          <SingleQueryResults spec={spec} />
        </div>
      ))}
    </div>
  )
}


