"use client"

import Link from "next/link"
import { MoreVertical } from "lucide-react"
import type { Market } from "@/lib/mock-data"
import { MarketTimer } from "./market-timer"

interface MarketCardProps {
  market: Market
}

export default function MarketCard({ market }: MarketCardProps) {
  return (
    <Link href={`/market/${market.id}`} className="block">
      <div className="group rounded-lg border border-muted-foreground/20 bg-card transition-all hover:border-primary hover:shadow-lg">
        {/* Image */}
        {/* Image */}
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-muted">
          <img
            src={market.image}
            alt={market.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="flex-1 text-sm font-semibold leading-tight text-foreground">{market.title}</h3>
            {/* <button className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </button> */}
          </div>

          {/* Binary Market */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded bg-muted p-2">
              <span className="text-xs font-medium text-foreground">{market.outcomes[0].name}</span>
              <span className="text-lg font-bold text-primary">{market.outcomes[0].probability}%</span>
            </div>
            <div className="flex items-center justify-between rounded bg-muted p-2">
              <span className="text-xs font-medium text-foreground">{market.outcomes[1].name}</span>
              <span className="text-lg font-bold text-primary">{market.outcomes[1].probability}%</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">${market.volume}m Vol.</span>
            {market.endTime && (
              <div className="scale-75 origin-right">
                <MarketTimer endTime={market.endTime} />
              </div>
            )}
            {market.tag && <span className="text-xs text-muted-foreground">{market.tag}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
