"use client"

import MarketCard from "./market-card"
import type { Market } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface MarketGridProps {
  markets: Market[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export default function MarketGrid({ markets, columns, className }: MarketGridProps) {
  const gridCols = columns
    ? {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }[columns]
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols, className)}>
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  )
}
