"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useBalance } from "wagmi"
import { formatEther } from "viem"
import { Loader2, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"

export function WalletBalance() {
    const { user, authenticated } = usePrivy()
    const address = user?.wallet?.address as `0x${string}` | undefined

    const { data: ethBalance, isLoading: isLoadingEth } = useBalance({
        address,
    })

    const isLoadingUsdc = false
    const usdcBalance = { formatted: "0.00", symbol: "USDC", value: BigInt(0) }

    if (!authenticated) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-border/10 rounded-3xl bg-secondary/20 backdrop-blur-xl text-center space-y-3">
                <Wallet className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Connect wallet to view portfolio</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Main Gradient Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-6 shadow-2xl shadow-fuchsia-500/20 text-white group transition-all hover:scale-[1.01]">

                {/* Decorative background blurs */}
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:translate-x-4 group-hover:translate-y-4" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-black/10 blur-3xl transition-transform duration-700 group-hover:-translate-x-4 group-hover:-translate-y-4" />

                <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
                            <h2 className="text-4xl font-bold tracking-tight">
                                $0.00
                            </h2>
                        </div>
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button className="flex-1 bg-white text-fuchsia-900 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                            <ArrowDownLeft className="h-4 w-4" />
                            Deposit
                        </button>
                        <button className="flex-1 bg-black/20 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-black/30 backdrop-blur-md transition-colors flex items-center justify-center gap-2">
                            <ArrowUpRight className="h-4 w-4" />
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Asset List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Assets</h3>
                </div>
                <div className="rounded-3xl border border-border/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-sm dark:border-white/5">
                    <AssetRow
                        icon={<div className="h-10 w-10 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">Ξ</div>}
                        name="Ethereum"
                        symbol="ETH"
                        amount={ethBalance?.value ? formatEther(ethBalance.value) : "0.0000"}
                        value="$0.00"
                        change="+2.4%"
                        isLoading={isLoadingEth}
                    />
                    <div className="h-[1px] bg-border/5 dark:bg-white/5 mx-4" />
                    <AssetRow
                        icon={<div className="h-10 w-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">$</div>}
                        name="USD Coin"
                        symbol="USDC"
                        amount={usdcBalance.formatted}
                        value="$0.00"
                        change="+0.1%"
                        isLoading={isLoadingUsdc}
                    />
                </div>
            </div>
        </div>
    )
}

function AssetRow({ icon, name, symbol, amount, value, change, isLoading }: {
    icon: React.ReactNode,
    name: string,
    symbol?: string,
    amount?: string,
    value: string,
    change: string,
    isLoading: boolean
}) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                {icon}
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground dark:text-white/90 transition-colors">{name}</span>
                    <span className="text-xs text-muted-foreground dark:text-white/50">{symbol}</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                {/* Sparkline placeholder could go here */}
                <div className="flex flex-col items-end gap-0.5">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <span className="text-sm font-bold text-foreground dark:text-white/90">{amount}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-muted-foreground dark:text-white/50">{value}</span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">{change}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
