"use client"

import { useState, useEffect, useMemo } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseUnits, formatUnits, type Address } from "viem"
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
    const colorClass = isGreen ? "text-green-500" : "text-red-500"
    const bgClass = isGreen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"

    return (
        <div className={`bg-card border border-muted-foreground/20 rounded-lg p-6 space-y-4`}>
            <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">{outcome}</span>
                <span className={`text-2xl font-bold ${colorClass}`}>{probability}%</span>
            </div>

            <div className="space-y-2">
                <Input
                    type="number"
                    placeholder="Amount (USDC)"
                    className="border border-muted-foreground/20 rounded-lg p-2"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isPending}
                />
                <Button
                    className={`w-full ${isAllowanceSufficient ? bgClass : ""}`}
                    onClick={isAllowanceSufficient ? handleBuy : handleApprove}
                    disabled={isPending || !amount || parseFloat(amount) <= 0}
                    variant={isAllowanceSufficient ? "default" : "secondary"}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {buttonLabel}
                </Button>
            </div>
            {buyHash && <div className="text-xs text-muted-foreground break-all">Tx: {buyHash}</div>}
        </div>
    )
}
