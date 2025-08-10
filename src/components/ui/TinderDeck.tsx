import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

export type DeckCard = {
  id: string
  title: string
  priceLabel: string
  imageUrl: string
}

type Props = {
  cards: DeckCard[]
  onSwipeRight: (id: string) => void
  onSwipeLeft: (id: string) => void
  onEnd: () => void
}

export function TinderDeck({ cards, onSwipeRight, onSwipeLeft, onEnd }: Props) {
  const [index, setIndex] = useState(0)
  const current = cards[index]
  const next = cards[index + 1]

  useEffect(() => {
    if (index >= cards.length && cards.length > 0) {
      onEnd()
    }
  }, [index, cards.length, onEnd])

  const handleDismiss = useCallback(
    (dir: 'left' | 'right', id: string) => {
      if (dir === 'right') onSwipeRight(id)
      if (dir === 'left') onSwipeLeft(id)
      setIndex((i) => i + 1)
    },
    [onSwipeLeft, onSwipeRight]
  )

  if (!current) {
    return <div className="text-center py-10 text-gray-500">No more products</div>
  }

  return (
    <div className="relative h-[70vh] max-h-[720px] select-none">
      {next && (
        <div className="absolute inset-0 translate-y-2 scale-[0.98] opacity-95">
          <Card card={next} muted />
        </div>
      )}
      <div className="absolute inset-0">
        <DraggableCard card={current} onDismiss={handleDismiss} />
      </div>
    </div>
  )
}

function DraggableCard({ card, onDismiss }: { card: DeckCard; onDismiss: (dir: 'left' | 'right', id: string) => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12])
  const opacity = useTransform(x, [-300, 0, 300], [0.6, 1, 0.6])

  useEffect(() => {
    x.set(0)
  }, [card.id, x])

  const onDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 120
    const velocityThreshold = 500
    const offsetX = info.offset.x
    const velocityX = info.velocity.x
    const direction: 'left' | 'right' = offsetX < 0 ? 'left' : 'right'
    const shouldDismiss = Math.abs(offsetX) > threshold || Math.abs(velocityX) > velocityThreshold

    if (!shouldDismiss) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
      return
    }

    const targetX = direction === 'left' ? -window.innerWidth : window.innerWidth
    animate(x, targetX, { duration: 0.25 }).then(() => {
      onDismiss(direction, card.id)
      x.set(0)
    })
  }

  return (
    <motion.div
      className="w-full h-full"
      style={{ x, rotate, opacity }}
      drag="x"
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
    >
      <Card card={card} />
    </motion.div>
  )
}

function Card({ card, muted }: { card: DeckCard; muted?: boolean }) {
  return (
    <div className={[ 'h-full rounded-3xl overflow-hidden shadow-lg bg-white border flex flex-col', muted ? 'opacity-95' : '' ].join(' ')}>
      <div className="flex-1 bg-gray-100">
        <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold truncate pr-2">{card.title}</div>
          <div className="text-base font-bold">{card.priceLabel}</div>
        </div>
      </div>
    </div>
  )
}

export default TinderDeck


