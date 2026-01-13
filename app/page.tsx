"use client"

import Header from "@/components/header"
import MarketGrid from "@/components/market-grid"
import { useMarkets } from "@/hooks/useMarkets"
import { Loader2 } from "lucide-react"

import { Market } from "@/lib/mock-data"

function generateDummyMarkets(count: number): Market[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `dummy-${i}`,
    title: `Dummy Market Question ${i + 1}?`,
    image: "/bitcoin-concept.png",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 50 },
      { name: "No", probability: 50 },
    ],
    volume: Math.floor(Math.random() * 1000).toString(),
    tag: "dummy",
    startTime: Date.now(),
  }))
}

export default function Home() {
  const { markets, isLoading } = useMarkets()

  const dummyMarkets = generateDummyMarkets(80)
  const allMarkets = [...markets, ...dummyMarkets]

  console.log(markets)

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
      <Header />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {isLoading && (
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* All Markets Section */}
        {!isLoading && markets.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">All Markets</h2>
            </div>
            <MarketGrid markets={allMarkets} />
          </section>
        )}

        {/* Empty State */}
        {!isLoading && markets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 rounded-full bg-black/5 dark:bg-white/5">
              <span className="text-4xl">🤷‍♂️</span>
            </div>
            <h3 className="text-xl font-semibold">No markets yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Be the first to predict the future. Create a market and start trading.
            </p>
          </div>
        )}
      </main>


    </div>
  )
}
