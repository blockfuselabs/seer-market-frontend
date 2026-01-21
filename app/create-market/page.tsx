

import { MarketCreationForm } from "@/components/market/market-creation-form"
import Header from "@/components/layout/header"

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

                    <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm">
                        <MarketCreationForm />
                    </div>
                </div>
            </main>
        </div>
    )
}
