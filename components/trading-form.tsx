"use client"

import { useState, useEffect, useMemo } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseUnits, type Address } from "viem"
import { CONTRACT_ADDRESS, USDC_ADDRESS } from "@/lib/constants"
import LMSRABI from "@/lib/LMSRABI.json"
import { ERC20ABI } from "@/lib/erc20-abi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface TradingFormProps {
    marketId: string
    outcome: "YES" | "NO"
    probability: number
}

export function TradingForm({ marketId, outcome, probability }: TradingFormProps) {
    const { address } = useAccount()
    const [amount, setAmount] = useState("")

    // Approval State
    const { data: approveHash, isPending: isApprovePending, writeContract: writeApprove } = useWriteContract()
    const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } = useWaitForTransactionReceipt({
        hash: approveHash
    })

    // Buy State
    const { data: buyHash, isPending: isBuyPending, writeContract: writeBuy } = useWriteContract()
    const { isLoading: isConfirmingBuy, isSuccess: isConfirmedBuy } = useWaitForTransactionReceipt({
        hash: buyHash
    })

    // Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDC_ADDRESS as Address,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [address as Address, CONTRACT_ADDRESS as Address],
        query: {
            enabled: !!address,
        }
    })

    // Refetch allowance after approval confirms
    useEffect(() => {
        if (isConfirmedApprove) {
            refetchAllowance()
            toast.success("USDC Approved!")
        }
    }, [isConfirmedApprove, refetchAllowance])

    // Normalize amount to BigInt
    const amountBI = useMemo(() => {
        try {
            return amount ? parseUnits(amount, 6) : BigInt(0)
        } catch {
            return BigInt(0)
        }
    }, [amount])

    const isAllowanceSufficient = allowance ? allowance >= amountBI : false

    // Handlers
    function handleApprove() {
        if (!address) return toast.error("Please connect wallet")
        writeApprove({
            address: USDC_ADDRESS as Address,
            abi: ERC20ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESS as Address, amountBI],
        })
    }

    function handleBuy() {
        if (!address) return toast.error("Please connect wallet")
        if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount")

        const functionName = outcome === "YES" ? "buyYES" : "buyNO"

        writeBuy({
            address: CONTRACT_ADDRESS as Address,
            abi: LMSRABI as any,
            functionName: functionName,
            args: [BigInt(marketId), amountBI],
        })
    }

    useEffect(() => {
        if (isConfirmedBuy) {
            toast.success(`Broadcasting ${outcome} purchase!`)
            setAmount("")
        }
    }, [isConfirmedBuy, outcome])

    const isPending = isApprovePending || isConfirmingApprove || isBuyPending || isConfirmingBuy
    const buttonLabel = isApprovePending || isConfirmingApprove
        ? "Approving..."
        : isAllowanceSufficient
            ? (isBuyPending || isConfirmingBuy ? "Buying..." : `Buy ${outcome}`)
            : "Approve USDC"

    const isGreen = outcome === "YES"
    const colorClass = isGreen ? "text-emerald-500" : "text-red-500"
    const bgClass = isGreen ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"

    return (
        <div className="space-y-4">
            {/* Price Display */}
            <div className="flex justify-between items-end border-b border-border pb-4">
                <span className="text-sm font-medium text-muted-foreground">Current Price</span>
                <div className="text-right">
                    <div className={`text-3xl font-bold ${colorClass}`}>{probability}%</div>
                    <div className="text-xs text-muted-foreground">1 {outcome} = ${probability / 100}</div>
                </div>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
                <div className="relative">
                    <Input
                        type="number"
                        placeholder="0.00"
                        className="pr-16 text-lg font-medium border-border bg-secondary h-12 focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isPending}
                        min={0}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        USDC
                    </div>
                </div>

                {/* Simulated Output (Optional, could add later if logic existed) */}
                {/* <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Est. Return</span>
                    <span className="text-green-400">+$0.00 (0%)</span>
                </div> */}

                <Button
                    className={`w-full h-12 font-bold text-base transition-all ${isAllowanceSufficient ? bgClass : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                    onClick={isAllowanceSufficient ? handleBuy : handleApprove}
                    disabled={isPending || !amount || parseFloat(amount) <= 0}
                    variant="default"
                >
                    {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {buttonLabel}
                </Button>
            </div>

            {buyHash && (
                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 break-all">
                    <span className="font-semibold block mb-1">Transaction Sent:</span>
                    {buyHash}
                </div>
            )}
        </div>
    )
}
