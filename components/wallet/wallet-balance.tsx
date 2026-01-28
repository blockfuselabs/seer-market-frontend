"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBalance } from "wagmi"
import { formatEther } from "viem"
import { Loader2 } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"

// TODO: Replace with actual USDC address for the chain being used
const USDC_ADDRESS = "0x..." // Placeholder

export function WalletBalance() {
    const { user, authenticated } = usePrivy()
    const address = user?.wallet?.address as `0x${string}` | undefined

    const { data: ethBalance, isLoading: isLoadingEth } = useBalance({
        address,
    })

    // For USDC, we would use the token property. 
    // Since we don't have the exact address yet, I'll comment it out or leave it generic.
    // const { data: usdcBalance, isLoading: isLoadingUsdc } = useBalance({
    //   address,
    //   token: USDC_ADDRESS
    // })

    // Mocking USDC for visual purpose until we have the address
    const isLoadingUsdc = false
    const usdcBalance = { formatted: "0.00", symbol: "USDC" }

    if (!authenticated) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Wallet Balances</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please connect your wallet to view balances.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Balances</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <BalanceItem
                    label="Ethereum"
                    amount={ethBalance?.value ? formatEther(ethBalance.value) : undefined}
                    symbol={ethBalance?.symbol}
                    isLoading={isLoadingEth}
                />
                <BalanceItem
                    label="USDC"
                    amount={usdcBalance?.formatted}
                    symbol={usdcBalance?.symbol}
                    isLoading={isLoadingUsdc}
                />
            </CardContent>
        </Card>
    )
}

function BalanceItem({ label, amount, symbol, isLoading }: { label: string, amount?: string, symbol?: string, isLoading: boolean }) {
    return (
        <div className="flex flex-col gap-1 p-4 rounded-lg border bg-card/50">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                    <span className="text-2xl font-bold tracking-tight">
                        {amount ? amount : "0.00"} {symbol}
                    </span>
                )}
            </div>
        </div>
    )
}
