"use client"

import { useState, useEffect, useMemo } from "react"
import { useAccount, useReadContract } from "wagmi"
import { parseUnits, encodeFunctionData, type Address } from "viem"
import { baseSepolia } from "wagmi/chains"
import { CONTRACT_ADDRESS, USDC_ADDRESS } from "@/lib/constants"
import LMSRABI from "@/lib/LMSRABI.json"
import { ERC20ABI } from "@/lib/erc20-abi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { usePrivy, useSendTransaction, useWallets } from "@privy-io/react-auth"

interface TradingFormProps {
    marketId: string
    outcome: "YES" | "NO"
    probability: number
}

export function TradingForm({ marketId, outcome, probability }: TradingFormProps) {
    const { address } = useAccount()
    const { authenticated, login, ready, user } = usePrivy()
    const { sendTransaction } = useSendTransaction()
    const { wallets } = useWallets()
    
    const walletAddress = address || (user?.wallet?.address as `0x${string}` | undefined)
    const wallet = wallets[0] 
    
    const [amount, setAmount] = useState("")
    
    const [approveHash, setApproveHash] = useState<string | null>(null)
    const [isApprovePending, setIsApprovePending] = useState(false)
    const [buyHash, setBuyHash] = useState<string | null>(null)
    const [isBuyPending, setIsBuyPending] = useState(false)

   
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDC_ADDRESS as Address,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [walletAddress as Address, CONTRACT_ADDRESS as Address],
        query: {
            enabled: !!walletAddress,
        }
    })

    
    useEffect(() => {
        if (approveHash && !isApprovePending) {
            
            setTimeout(() => {
                refetchAllowance()
                toast.success("USDC Approved!")
            }, 2000)
        }
    }, [approveHash, isApprovePending, refetchAllowance])

    // Normalize amount to BigInt
    const amountBI = useMemo(() => {
        try {
            return amount ? parseUnits(amount, 6) : BigInt(0)
        } catch {
            return BigInt(0)
        }
    }, [amount])

    const isAllowanceSufficient = allowance ? allowance >= amountBI : false

    
    async function handleApprove() {
       
        if (!ready) {
            toast.error("Wallet is initializing, please wait...")
            return
        }

        if (!authenticated) {
            toast.info("Please connect your wallet first")
            login()
            return
        }

      
        if (!wallet || !walletAddress) {
            toast.error("Wallet not available. Please reconnect your wallet.")
            return
        }

        try {
            setIsApprovePending(true)
            
           
            const data = encodeFunctionData({
                abi: ERC20ABI,
                functionName: "approve",
                args: [CONTRACT_ADDRESS as Address, amountBI],
            })

          
            const { hash } = await sendTransaction(
                {
                    to: USDC_ADDRESS as Address,
                    data: data,
                    chainId: baseSepolia.id,
                },
                {
                    address: wallet.address as `0x${string}`,
                }
            )

            setApproveHash(hash)
            toast.success("Approval transaction sent!")
            setIsApprovePending(false)
        } catch (error) {
            setIsApprovePending(false)
            toast.error(`Failed to approve USDC: ${(error as any)?.message || "Unknown error"}`)
        }
    }

    async function handleBuy() {
      
        if (!ready) {
            toast.error("Wallet is initializing, please wait...")
            return
        }

      
        if (!authenticated) {
            toast.info("Please connect your wallet first")
            login()
            return
        }

     
        if (!wallet || !walletAddress) {
            toast.error("Wallet not available. Please reconnect your wallet.")
            return
        }

       
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Enter a valid amount")
            return
        }

        try {
            setIsBuyPending(true)
            
            const functionName = outcome === "YES" ? "buyYES" : "buyNO"

          
            const data = encodeFunctionData({
                abi: LMSRABI as any,
                functionName: functionName,
                args: [BigInt(marketId), amountBI],
            })

        
            const { hash } = await sendTransaction(
                {
                    to: CONTRACT_ADDRESS as Address,
                    data: data,
                    chainId: baseSepolia.id,
                },
                {
                    address: wallet.address as `0x${string}`,
                }
            )

            setBuyHash(hash)
            toast.success(`Buy ${outcome} transaction sent!`)
            setAmount("")
            setIsBuyPending(false)
        } catch (error) {
            setIsBuyPending(false)
            toast.error(`Failed to buy ${outcome}: ${(error as any)?.message || "Unknown error"}`)
        }
    }

    const isPending = isApprovePending || isBuyPending
    const buttonLabel = isApprovePending
        ? "Approving..."
        : isAllowanceSufficient
            ? (isBuyPending ? "Buying..." : `Buy ${outcome}`)
            : "Approve USDC"

    const isGreen = outcome === "YES"
    const colorClass = isGreen ? "text-emerald-500" : "text-red-500"
    const bgClass = isGreen ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"

    return (
        <div className="space-y-4">
            {/* Price Display */}
            <div className="flex justify-between items-end border-b border-border pb-4">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">Current Price</span>
                <div className="text-right">
                    <div className={`text-2xl md:text-3xl font-bold ${colorClass}`}>{probability}%</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">1 <span className="font-bold">{outcome}</span> = ${probability / 100}</div>
                </div>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
                <div className="relative">
                    <Input
                        type="number"
                        placeholder="0.00"
                        className="pr-16 text-base md:text-lg font-medium border-border bg-secondary h-10 md:h-12 focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
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
                    className={`w-full h-10 md:h-12 font-bold text-sm md:text-base transition-all ${isAllowanceSufficient ? bgClass : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
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
