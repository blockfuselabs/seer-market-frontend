"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, useSimulateContract } from "wagmi"
import { parseEther, parseUnits, type Address } from "viem"
import { CONTRACT_ADDRESS, USDC_ADDRESS } from "@/lib/constants"
import LMSRABI from "@/lib/LMSRABI.json"
import { ERC20ABI } from "@/lib/erc20-abi"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/lib/ipfs"
import { useEffect, useState } from "react"

const formSchema = z.object({
    question: z.string().min(10, {
        message: "Question must be at least 10 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    // Allow File object or empty string (before selection)
    image: z.any().refine((file) => file instanceof File || (typeof file !== 'string'), {
        message: "Image file is required.",
    }),
    resolutionSource: z.string().min(3, {
        message: "Resolution source is required.",
    }),
    liquidity: z.coerce.number().min(1, {
        message: "Initial liquidity must be at least 1.",
    }),
    startDate: z.string().refine((date) => new Date(date) > new Date(), {
        message: "Start date must be in the future.",
    }),
    endDate: z.string().refine((date) => new Date(date) > new Date(), {
        message: "End date must be in the future.",
    }),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date.",
    path: ["endDate"],
});

export function MarketCreationForm() {
    const { address } = useAccount()
    const { data: hash, isPending: isCreatePending, writeContractAsync: writeCreateMarketAsync } = useWriteContract()
    const { isLoading: isConfirmingCreate, isSuccess: isConfirmedCreate } =
        useWaitForTransactionReceipt({
            hash,
        })

    // Approval State
    const { data: approveHash, isPending: isApprovePending, writeContract: writeApprove } = useWriteContract()
    const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } = useWaitForTransactionReceipt({
        hash: approveHash
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: "",
            description: "",
            resolutionSource: "",
            liquidity: 100,
            startDate: "",
            endDate: "",
        },
    })

    const liquidity = form.watch("liquidity")

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

    const isAllowanceSufficient = allowance ? allowance >= parseEther(liquidity.toString()) : false

    async function handleApprove() {
        if (!address) return
        writeApprove({
            address: USDC_ADDRESS as Address,
            abi: ERC20ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESS as Address, parseEther(liquidity.toString())],
        })
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Submitting form...", values);
        if (!isAllowanceSufficient) {
            handleApprove();
            return;
        }

        try {
            const loadingToast = toast.loading("Uploading image to IPFS...");
            console.log("Uploading image to IPFS...");

            // 1. Upload Image
            let imageCid = "";
            if (values.image instanceof File) {
                try {
                    imageCid = await uploadFileToIPFS(values.image);
                } catch (error) {
                    toast.dismiss(loadingToast);
                    console.error("IPFS Image Error:", error);
                    toast.error("Failed to upload image. Check your API keys.");
                    return;
                }
            } else {
                console.warn("No image file provided or invalid type", values.image);
            }

            console.log("Image uploaded to IPFS: ", imageCid);

            toast.dismiss(loadingToast);

            // 2. Upload Metadata
            const metadataToast = toast.loading("Uploading metadata to IPFS...");
            const metadata = {
                question: values.question,
                description: values.description,
                image: `ipfs://${imageCid}`,
                resolutionSource: values.resolutionSource
            };

            console.log("Metadata: ", metadata);

            let metadataCid = "";
            try {
                metadataCid = await uploadJSONToIPFS(metadata);
            } catch (error) {
                toast.dismiss(metadataToast);
                console.error("IPFS Metadata Error:", error);
                toast.error("Failed to upload metadata. Check your API keys.");
                return;
            }

            toast.dismiss(metadataToast);
            toast.success("Metadata uploaded! Creating market...");

            // 3. Create Market
            const startTime = Math.floor(new Date(values.startDate).getTime() / 1000)
            const endTime = Math.floor(new Date(values.endDate).getTime() / 1000)

            console.log("Creating market with args:", {
                liquidity: parseEther(values.liquidity.toString()),
                startTime,
                endTime,
                question: values.question,
                metadataCid
            });

            await writeCreateMarketAsync({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: LMSRABI,
                functionName: 'createMarket',
                args: [
                    parseUnits(values.liquidity.toString(), 6), // _b
                    BigInt(startTime),
                    BigInt(endTime),
                    values.question,
                    metadataCid // _cId
                ],
            })
        } catch (error) {
            console.error("Create Market Error:", error)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error(`Failed to create market: ${(error as any).message || "Unknown error"}`)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error("Form Validation Errors:", errors))} className="space-y-8">
                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                                <Input placeholder="Will BTC hit $100k by 2025?" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Provide more details about the market..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <Input
                                        {...fieldProps}
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            const file = event.target.files && event.target.files[0];
                                            if (file) {
                                                onChange(file);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="resolutionSource"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resolution Source</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Binance API, CoinGecko" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="liquidity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Initial Liquidity (USDC)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Higher liquidity means less slippage.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {isAllowanceSufficient ? (
                    <Button type="submit" disabled={isCreatePending || isConfirmingCreate} className="w-full">
                        {isCreatePending ? "Confirming..." : isConfirmingCreate ? "Processing..." : "Create Market"}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleApprove}
                        disabled={isApprovePending || isConfirmingApprove}
                        className="w-full"
                        variant="secondary"
                    >
                        {isApprovePending ? "Confirming Approval..." : isConfirmingApprove ? "Processing Approval..." : "Approve USDC"}
                    </Button>
                )}

                {hash && <div className="text-sm text-muted-foreground break-all">Create Tx: {hash}</div>}
                {approveHash && <div className="text-sm text-muted-foreground break-all">Approve Tx: {approveHash}</div>}
                {isConfirmedCreate && <div className="text-sm text-green-500 font-medium">Market Created Successfully!</div>}
            </form>
        </Form>
    )
}
