"use client"

import Header from "@/components/header"
import MarketGrid from "@/components/market-grid"
import { useMarkets } from "@/hooks/useMarkets"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { markets, isLoading } = useMarkets()

  const featuredMarkets = markets.slice(0, 3);
  const allMarkets = markets; // In a real app, this might be paginated or different

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Hero / Trending Section */}
        {!isLoading && markets.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="text-primary">🔥</span> Trending
              </h2>
            </div>
            <MarketGrid markets={featuredMarkets} columns={3} />
          </section>
        )}

        {/* All Markets Section */}
        {!isLoading && markets.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white">All Markets</h2>
            <MarketGrid markets={allMarkets} />
          </section>
        )}

        {/* Empty State */}
        {!isLoading && markets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 rounded-full bg-white/5">
              <span className="text-4xl">🤷‍♂️</span>
            </div>
            <h3 className="text-xl font-semibold">No markets yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Be the first to predict the future. Create a market and start trading.
            </p>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="mt-auto border-t border-white/10 bg-black/20 py-8 backdrop-blur-lg">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>Precast Inc. © 2026. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
