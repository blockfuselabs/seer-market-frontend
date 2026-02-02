"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { isAddress, parseEther, parseUnits, erc20Abi } from "viem"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Loader2 } from "lucide-react"
import { useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { USDC_ADDRESS } from "@/lib/constants"
import { toast } from "sonner"

const formSchema = z.object({
    recipient: z.string().refine((val) => isAddress(val), {
        message: "Invalid address",
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Required",
    }),
    token: z.enum(["ETH", "USDC"]),
})

export function TransferForm() {
    // ETH Transfer
    const { sendTransactionAsync, isPending: isEthPending } = useSendTransaction()

    // USDC Transfer
    const { writeContractAsync, isPending: isUsdcPending } = useWriteContract()

    const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash,
    })

    const isLoading = isEthPending || isUsdcPending || isConfirming

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            recipient: "",
            amount: "",
            token: "ETH",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            let hash: `0x${string}`

            if (values.token === "ETH") {
                hash = await sendTransactionAsync({
                    to: values.recipient as `0x${string}`,
                    value: parseEther(values.amount),
                })
            } else {
                hash = await writeContractAsync({
                    address: USDC_ADDRESS as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'transfer',
                    args: [values.recipient as `0x${string}`, parseUnits(values.amount, 6)], // USDC has 6 decimals
                })
            }

            setTxHash(hash)
            toast.success(`Transaction submitted: ${hash.slice(0, 6)}...${hash.slice(-4)}`)
            form.reset()

        } catch (error) {
            console.error(error)
            toast.error("Transaction failed. Check console for details.")
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-medium text-muted-foreground">Quick Transfer</h3>
            </div>

            <div className="flex-1 rounded-3xl border border-border/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 shadow-xl dark:border-white/10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-medium text-muted-foreground dark:text-white/70">Select Asset</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 rounded-2xl bg-black/5 dark:bg-white/5 border-border/5 dark:border-white/5 text-foreground dark:text-white focus:ring-0 focus:ring-offset-0 focus:border-border/20 dark:focus:border-white/20 transition-all hover:bg-black/10 dark:hover:bg-white/10">
                                                <SelectValue placeholder="Select asset" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-border/10 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl text-foreground dark:text-white">
                                            <SelectItem value="ETH" className="focus:bg-black/10 dark:focus:bg-white/10 cursor-pointer">Ethereum (ETH)</SelectItem>
                                            <SelectItem value="USDC" className="focus:bg-black/10 dark:focus:bg-white/10 cursor-pointer">USD Coin (USDC)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs text-red-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="recipient"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-medium text-muted-foreground dark:text-white/70">Recipient</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="0x..."
                                            {...field}
                                            className="h-11 rounded-2xl bg-black/5 dark:bg-white/5 border-border/5 dark:border-white/5 text-foreground dark:text-white font-mono text-sm placeholder:text-muted-foreground/50 dark:placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-border/20 dark:focus-visible:border-white/20 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-xs font-medium text-muted-foreground dark:text-white/70">Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 dark:text-white/30 text-lg font-light">$</div>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                placeholder="0.00"
                                                {...field}
                                                className="h-14 pl-8 rounded-2xl bg-black/5 dark:bg-white/5 border-border/5 dark:border-white/5 text-2xl font-bold text-foreground dark:text-white placeholder:text-muted-foreground/20 dark:placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-border/20 dark:focus-visible:border-white/20 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground/50 dark:text-white/50 uppercase">
                                                {form.watch("token")}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs text-red-400" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg shadow-fuchsia-900/20 mt-4 transition-all active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span className="text-sm">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm">Confirm Transfer</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
