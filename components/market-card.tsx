"use client"

import Link from "next/link"
import { ArrowUpRight, TrendingUp } from "lucide-react"
import type { Market } from "@/lib/mock-data"
import { MarketTimer } from "./market-timer"

interface MarketCardProps {
  market: Market
}

export default function MarketCard({ market }: MarketCardProps) {
  const yesOutcome = market.outcomes.find(o => o.name === 'Yes') || market.outcomes[0];
  const noOutcome = market.outcomes.find(o => o.name === 'No') || market.outcomes[1];

  return (
    <Link href={`/market/${market.id}`} className="group block h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-sm border-[0.2px] border-border dark:border-gray-800 bg-card text-card-foreground transition-all delay-0 hover:-translate-y-px hover:bg-gray-100 dark:hover:bg-gray-900 backdrop-blur-sm">

        {/* Card Header: Image & Title */}
        <div className="flex items-start gap-2.5 p-5">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
            <img
              src={market.image}
              alt={market.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="line-clamp-2 text-base md:text-lg font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
              {market.title}
            </h3>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
              {market.tag && <span className="uppercase tracking-wider font-medium opacity-80">{market.tag}</span>}
            </div>
          </div>
        </div>

        {/* Probabilities / Graph Area */}
        <div className="mt-auto px-2.5 pb-2.5">
          <div className="grid grid-cols-2 gap-1.5">
            {/* Yes Outcome */}
            <div className="relative flex items-center justify-between overflow-hidden rounded-sm bg-emerald-100 dark:bg-emerald-500/10 border border-transparent hover:bg-emerald-200 dark:hover:bg-emerald-500/20 hover:border-emerald-500/20 px-3 py-1.5 transition-all hover:shadow-sm hover:shadow-emerald-500/5">
              <span className="text-sm md:text-base font-bold text-emerald-800 dark:text-emerald-400">Yes</span>
              <div className="relative flex items-center justify-center">
                {/* Full Circle Gauge */}
                <svg viewBox="0 0 36 36" className="h-8 w-8 text-emerald-600 dark:text-emerald-400 -rotate-90">
                  {/* Background Circle */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-10" />
                  {/* Progress Circle */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${yesOutcome.probability}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 leading-none">{yesOutcome.probability}%</span>
              </div>
            </div>

            {/* No Outcome */}
            <div className="relative flex items-center justify-between overflow-hidden rounded-sm bg-red-100 dark:bg-red-500/10 border border-transparent hover:bg-red-200 dark:hover:bg-red-500/20 hover:border-red-500/20 px-3 py-1.5 transition-all hover:shadow-sm hover:shadow-red-500/5">
              <span className="text-sm md:text-base font-bold text-red-800 dark:text-red-400">No</span>
              <div className="relative flex items-center justify-center">
                {/* Full Circle Gauge */}
                <svg viewBox="0 0 36 36" className="h-8 w-8 text-red-600 dark:text-red-400 -rotate-90">
                  {/* Background Circle */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-10" />
                  {/* Progress Circle */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${noOutcome.probability}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[10px] font-extrabold text-red-800 dark:text-red-400 leading-none">{noOutcome.probability}%</span>
              </div>
            </div>
          </div>

          {/* Timer Footer */}
          <div className="mt-2.5 flex items-center justify-start">
            <MarketTimer endTime={market.endTime} />
          </div>
        </div>
      </div>
    </Link>
  )
}
