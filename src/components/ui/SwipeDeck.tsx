import React, { useCallback, useMemo, useRef, useState } from 'react'

type Card = {
  id: string
  title: string
  price: string
  image: string
}

type Props = {
  cards: Card[]
  onLike: (id: string) => void
  onDislike: (id: string) => void
  onBuy: (id: string) => void
}

export function SwipeDeck({ cards, onLike, onDislike, onBuy }: Props) {
  const [index, setIndex] = useState(0)
  const current = cards[index]
  const next = cards[index + 1]

  const like = useCallback(() => {
    if (!current) return
    onLike(current.id)
    setIndex(i => i + 1)
  }, [current, onLike])

  const dislike = useCallback(() => {
    if (!current) return
    onDislike(current.id)
    setIndex(i => i + 1)
  }, [current, onDislike])

  const buy = useCallback(() => {
    if (!current) return
    onBuy(current.id)
  }, [current, onBuy])

  if (!current) {
    return (
      <div className="text-center py-20 text-gray-600">No more products</div>
    )
  }

  return (
    <div className="relative h-[70vh] max-h-[720px] select-none">
      {/* Top (next) card for depth */}
      {next && (
        <div className="absolute inset-0 translate-y-3 scale-[0.98] opacity-90">
          <DeckCard card={next} muted />
        </div>
      )}
      {/* Current card */}
      <div className="absolute inset-0">
        <DeckCard card={current} onLike={like} onDislike={dislike} onBuy={buy} />
      </div>
      {/* Action buttons */}
      <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-4">
        <button aria-label="Dislike" onClick={dislike} className="w-12 h-12 rounded-full bg-white border shadow-md active:scale-95">✖️</button>
        <button aria-label="Buy" onClick={buy} className="h-12 px-5 rounded-full bg-black text-white shadow-md active:scale-95">Buy now</button>
        <button aria-label="Like" onClick={like} className="w-12 h-12 rounded-full bg-white border shadow-md active:scale-95">❤️</button>
      </div>
    </div>
  )
}

function DeckCard({ card, onLike, onDislike, onBuy, muted }: { card: Card; onLike?: () => void; onDislike?: () => void; onBuy?: () => void; muted?: boolean }) {
  return (
    <div className={[ 'h-full rounded-3xl overflow-hidden shadow-lg bg-white border flex flex-col', muted ? 'opacity-90' : '' ].join(' ')}>
      <div className="flex-1 bg-gray-100">
        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold truncate pr-2">{card.title}</div>
          <div className="text-base font-bold">{card.price}</div>
        </div>
        {onLike && onDislike && onBuy && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <button onClick={onDislike} className="h-10 rounded-full border bg-white active:scale-95">Nope</button>
            <button onClick={onBuy} className="h-10 rounded-full bg-blue-600 text-white active:scale-95">Buy</button>
            <button onClick={onLike} className="h-10 rounded-full border bg-white active:scale-95">Like</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SwipeDeck


