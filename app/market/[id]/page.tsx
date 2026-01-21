"use client"

import { useMarket } from "@/hooks/useMarket"
import Header from "@/components/layout/header"
import { useQuery } from "@tanstack/react-query"
import { gql } from "graphql-request"
import { fetchSubgraph } from "@/lib/subgraph"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { TradingForm } from "@/components/market/trading-form"
import { MarketResolution } from "@/components/market/market-resolution"
import { MarketTimer } from "@/components/market/market-timer"
import { ClaimWinnings } from "@/components/market/claim-winnings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketDetailSkeleton } from "@/components/skeletons/market-detail-skeleton"
import { MarketChart } from "@/components/market/market-chart"

export default function EventPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const outcome = searchParams.get("outcome")
    const defaultTab = outcome === "NO" ? "NO" : "YES"
    const id = params.id as string
    const { market, isLoading } = useMarket(id)

    // Subgraph Query for Shares Bought
    const query = gql`
        query GetSharesBought($marketId: String!) {
            sharesBoughts(
                first: 1000
                orderBy: blockTimestamp
                orderDirection: asc
                where: { marketId: $marketId }
            ) {
                id
                marketId
                user
                yes
                amount
                cost
                priceYES
                priceNO
                blockTimestamp
            }
        }
    `

    const { data: subgraphData } = useQuery({
        queryKey: ['sharesBoughts', id],
        queryFn: async () => fetchSubgraph(query, { marketId: id })
    })

    console.log("Subgraph Response:", subgraphData)

    if (isLoading) {
        return <MarketDetailSkeleton />
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

            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Left Column: Market Info (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Header Section */}
                        <div className="flex flex-row items-center gap-3 mb-4">
                            {/* Image Thumbnail */}
                            <div className="relative h-10 w-10 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                <Image
                                    src={market.image}
                                    alt={market.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            {/* Title & Info */}
                            <div className="flex flex-col justify-center space-y-0.5">
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                                    {market.tag && <span className="uppercase tracking-wider font-semibold text-[9px] md:text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">{market.tag}</span>}
                                    <span className="text-muted-foreground">•</span>
                                    <span>Ends {market.endDate}</span>
                                </div>
                                <h1 className="text-sm md:text-lg font-bold tracking-tight text-foreground leading-tight">{market.title}</h1>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="rounded-none border-none bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
                            <MarketChart data={subgraphData?.sharesBoughts} />
                        </div>

                        {/* Description & Rules */}
                        <div className="prose dark:prose-invert max-w-none text-foreground">
                            <h3 className="text-base md:text-xl font-semibold mb-2 text-foreground">Description</h3>
                            {market.description ? (
                                <p className="text-xs md:text-base text-muted-foreground leading-relaxed">{market.description}</p>
                            ) : (
                                <p className="text-xs md:text-base text-muted-foreground italic">No description provided.</p>
                            )}

                            <div className="mt-6 rounded-lg border border-border bg-secondary p-4 md:p-6">
                                <h3 className="text-sm md:text-lg font-semibold mb-3 text-foreground">Market Rules</h3>
                                <dl className="space-y-3 text-xs md:text-sm">
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
                                <Tabs defaultValue={defaultTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 rounded-t-xl bg-muted/50 p-0 h-auto">
                                        <TabsTrigger
                                            value="YES"
                                            className="h-10 md:h-12 rounded-tl-xl rounded-tr-none rounded-br-none rounded-bl-none data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 transition-all font-bold"
                                        >
                                            Buy Yes
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="NO"
                                            className="h-10 md:h-12 rounded-tr-xl rounded-tl-none rounded-br-none rounded-bl-none data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-500/20 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-500 transition-all font-bold"
                                        >
                                            Buy No
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="p-3 md:p-4">
                                        <TabsContent value="YES" className="mt-0">
                                            <TradingForm
                                                marketId={id}
                                                outcome="YES"
                                                probability={market.outcomes[0].probability}
                                                isExpired={market.isExpired ?? false}
                                            />
                                        </TabsContent>
                                        <TabsContent value="NO" className="mt-0">
                                            <TradingForm
                                                marketId={id}
                                                outcome="NO"
                                                probability={market.outcomes[1].probability}
                                                isExpired={market.isExpired ?? false}
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
