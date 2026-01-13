"use client"

import { useMarket } from "@/hooks/useMarket"
import Header from "@/components/header"
import { useParams } from "next/navigation"
import Image from "next/image"
import { TradingForm } from "@/components/trading-form"
import { MarketResolution } from "@/components/market-resolution"
import { MarketTimer } from "@/components/market-timer"
import { ClaimWinnings } from "@/components/claim-winnings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function EventPage() {
    const params = useParams()
    const id = params.id as string
    const { market, isLoading } = useMarket(id)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (!market) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex justify-center py-20">
                    <div className="p-4 rounded-full bg-muted/20 text-muted-foreground">Market not found</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Market Info (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Header Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {market.tag && <span className="uppercase tracking-wider font-medium text-xs bg-primary/10 text-primary px-2 py-1 rounded">{market.tag}</span>}
                                {market.endDate && <span>Ends {market.endDate}</span>}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{market.title}</h1>

                            {/* Image Banner */}
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                                <Image
                                    src={market.image}
                                    alt={market.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* Description & Rules */}
                        <div className="prose dark:prose-invert max-w-none text-foreground">
                            <h3 className="text-xl font-semibold mb-2 text-foreground">Description</h3>
                            {market.description ? (
                                <p className="text-muted-foreground leading-relaxed">{market.description}</p>
                            ) : (
                                <p className="text-muted-foreground italic">No description provided.</p>
                            )}

                            <div className="mt-8 rounded-lg border border-border bg-secondary p-6">
                                <h3 className="text-lg font-semibold mb-4 text-foreground">Market Rules</h3>
                                <dl className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-border pb-2">
                                        <dt className="text-muted-foreground">Category</dt>
                                        <dd className="font-medium text-foreground">{market.category || "General"}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-border pb-2">
                                        <dt className="text-muted-foreground">Resolution Source</dt>
                                        <dd className="font-medium text-foreground">{market.resolutionSource || "Oracle"}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-border pb-2">
                                        <dt className="text-muted-foreground">Start Date</dt>
                                        <dd className="font-medium text-foreground">{market.startDate}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-border pb-2">
                                        <dt className="text-muted-foreground">End Date</dt>
                                        <dd className="font-medium text-foreground">{market.endDate}</dd>
                                    </div>
                                    <div className="pt-2">
                                        <dt className="text-muted-foreground mb-1">Status</dt>
                                        <dd><MarketTimer endTime={market.endTime} /></dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Trading Sidebar (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            {/* Actions that don't need tabs */}
                            <MarketResolution marketId={id} />
                            <ClaimWinnings
                                marketId={id}
                                resolved={market.resolved}
                                yesWon={market.yesWon}
                            />

                            {/* Trading Widget */}
                            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                                <Tabs defaultValue="YES" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 rounded-t-xl bg-muted/50 p-0 h-auto">
                                        <TabsTrigger
                                            value="YES"
                                            className="h-12 rounded-tl-xl rounded-tr-none rounded-br-none rounded-bl-none data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 transition-all font-medium"
                                        >
                                            Buy Yes
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="NO"
                                            className="h-12 rounded-tr-xl rounded-tl-none rounded-br-none rounded-bl-none data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-500/20 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-500 transition-all font-medium"
                                        >
                                            Buy No
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="p-4">
                                        <TabsContent value="YES" className="mt-0">
                                            <TradingForm
                                                marketId={id}
                                                outcome="YES"
                                                probability={market.outcomes[0].probability}
                                            />
                                        </TabsContent>
                                        <TabsContent value="NO" className="mt-0">
                                            <TradingForm
                                                marketId={id}
                                                outcome="NO"
                                                probability={market.outcomes[1].probability}
                                            />
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
