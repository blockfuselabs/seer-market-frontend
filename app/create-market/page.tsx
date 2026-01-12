"use client"

import { MarketCreationForm } from "@/components/market-creation-form"
import Header from "@/components/header"

export default function CreateMarketPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-12 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Market</h1>
                        <p className="text-muted-foreground">Launch a new prediction market for others to trade on.</p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-card/40 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
                        <MarketCreationForm />
                    </div>
                </div>
            </main>
        </div>
    )
}
