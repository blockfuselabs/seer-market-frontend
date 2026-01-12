"use client"

import Link from "next/link"
import { ArrowUpRight, TrendingUp } from "lucide-react"
import type { Market } from "@/lib/mock-data"
// import { MarketTimer } from "./market-timer"

interface MarketCardProps {
  market: Market
}

export default function MarketCard({ market }: MarketCardProps) {
  const yesOutcome = market.outcomes.find(o => o.name === 'Yes') || market.outcomes[0];
  const noOutcome = market.outcomes.find(o => o.name === 'No') || market.outcomes[1];

  return (
    <Link href={`/market/${market.id}`} className="group block h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-card/40 text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 backdrop-blur-sm">

        {/* Card Header: Image & Title */}
        <div className="flex items-start gap-4 p-4">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/10">
            <img
              src={market.image}
              alt={market.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
              {market.title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {market.tag && <span className="uppercase tracking-wider font-medium text-[10px]">{market.tag}</span>}
              {/* <span>•</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2d left</span> */}
            </div>
          </div>
        </div>

        {/* Probabilities / Graph Area */}
        <div className="mt-auto px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Yes Outcome */}
            <div className={`relative flex flex-col justify-between overflow-hidden rounded-lg bg-emerald-500/10 p-2 transition-colors hover:bg-emerald-500/20 border border-emerald-500/20`}>
              <div className="text-xs font-medium text-emerald-500 mb-1">Yes</div>
              <div className="text-lg font-bold text-emerald-400">{yesOutcome.probability}%</div>
            </div>

            {/* No Outcome */}
            <div className={`relative flex flex-col justify-between overflow-hidden rounded-lg bg-red-500/10 p-2 transition-colors hover:bg-red-500/20 border border-red-500/20`}>
              <div className="text-xs font-medium text-red-500 mb-1">No</div>
              <div className="text-lg font-bold text-red-400">{noOutcome.probability}%</div>
            </div>
          </div>

          {/* Volume Footer */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Vol
              </span>
              <span className="font-medium text-foreground">${market.volume}m</span>
            </div>
            <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </Link>
  )
}
