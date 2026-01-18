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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/lib/ipfs"
import { useEffect, useState } from "react"
import { DateTimePicker } from "@/components/ui/datetime-picker"

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
    category: z.string().min(1, {
        message: "Category is required.",
    }),
    customCategory: z.string().optional(),
    resolutionSource: z.string().min(3, {
        message: "Resolution source is required.",
    }),
    liquidity: z.coerce.number().min(1, {
        message: "Initial liquidity must be at least 1.",
    }),
    startDate: z.date({
        required_error: "Start date is required.",
    }).refine((date) => date > new Date(), {
        message: "Start date must be in the future.",
    }),
    endDate: z.date({
        required_error: "End date is required.",
    }).refine((date) => date > new Date(), {
        message: "End date must be in the future.",
    }),
}).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
}).refine((data) => {
    if (data.category === "Other") {
        return data.customCategory && data.customCategory.trim().length > 0;
    }
    return true;
}, {
    message: "Custom category is required when 'Other' is selected.",
    path: ["customCategory"],
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
            category: "",
            customCategory: "",
            resolutionSource: "",
            liquidity: 100,
            // startDate: undefined, // removed default string
            // endDate: undefined,
        },
    })

    const liquidity = form.watch("liquidity")
    const imageFile = form.watch("image")
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Handle image preview
    useEffect(() => {
        if (imageFile instanceof File) {
            const previewUrl = URL.createObjectURL(imageFile)
            setImagePreview(previewUrl)
            return () => {
                URL.revokeObjectURL(previewUrl)
            }
        } else {
            setImagePreview(null)
        }
    }, [imageFile])

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
                category: values.category === "Other" && values.customCategory ? values.customCategory : values.category,
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
            // Dates are already Date objects
            let startTime = Math.floor(values.startDate.getTime() / 1000)
            const endTime = Math.floor(values.endDate.getTime() / 1000)
            const now = Math.floor(Date.now() / 1000)

            if (startTime <= now) {
                console.warn("Start time is in the past, adjusting to now + 60s")
                startTime = now + 60
            }

            console.log("Creating market with args:", {
                liquidity: parseUnits(values.liquidity.toString(), 6),
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
                // Manual gas limit to bypass estimation errors if simulation fails vaguely
                gas: BigInt(1000000),
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

                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2 text-foreground">1. Market Details</h3>
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Will BTC hit $100k by 2025?" {...field} className="bg-secondary border-border text-foreground focus:ring-primary" />
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
                                    <Textarea placeholder="Provide context and resolution criteria..." {...field} className="min-h-[100px] bg-secondary border-border text-foreground" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    if (value !== "Other") {
                                        form.setValue("customCategory", "");
                                    }
                                }} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-secondary border-border text-foreground w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Crypto">Crypto</SelectItem>
                                        <SelectItem value="Politics">Politics</SelectItem>
                                        <SelectItem value="Sports">Sports</SelectItem>
                                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                                        <SelectItem value="Technology">Technology</SelectItem>
                                        <SelectItem value="Economics">Economics</SelectItem>
                                        <SelectItem value="World Events">World Events</SelectItem>
                                        <SelectItem value="Other">Other (Custom)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {form.watch("category") === "Other" && (
                        <FormField
                            control={form.control}
                            name="customCategory"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Category</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your custom category"
                                            {...field}
                                            className="bg-secondary border-border text-foreground focus:ring-primary"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>Market Image</FormLabel>
                                <FormControl>
                                    <Input
                                        {...fieldProps}
                                        type="file"
                                        accept="image/*"
                                        className="bg-secondary border-border cursor-pointer file:cursor-pointer file:text-primary file:border-0 file:bg-transparent file:font-semibold text-foreground"
                                        onChange={(event) => {
                                            const file = event.target.files && event.target.files[0];
                                            if (file) {
                                                onChange(file);
                                            }
                                        }}
                                    />
                                </FormControl>
                                {imagePreview && (
                                    <div className="mt-3">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="rounded-lg border border-border max-w-full h-auto max-h-64 object-contain"
                                        />
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Section 2: Resolution & Timeline */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2 text-foreground">2. Resolution & Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="resolutionSource"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resolution Source</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Binance API, CoinGecko" {...field} className="bg-secondary border-border text-foreground" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                    <DateTimePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                    <DateTimePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Section 3: Funding */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-border pb-2 text-foreground">3. Liquidity</h3>
                    <FormField
                        control={form.control}
                        name="liquidity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Initial Liquidity (USDC)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} className="bg-secondary border-border text-foreground" />
                                </FormControl>
                                <FormDescription>Higher liquidity means less slippage for traders.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4">
                    {isAllowanceSufficient ? (
                        <Button type="submit" disabled={isCreatePending || isConfirmingCreate} className="w-full text-base font-semibold h-12">
                            {isCreatePending ? "Confirming..." : isConfirmingCreate ? "Processing..." : "Create Market"}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleApprove}
                            disabled={isApprovePending || isConfirmingApprove}
                            className="w-full font-semibold h-12 bg-emerald-600 text-white hover:bg-emerald-700"
                            variant="default"
                        >
                            {isApprovePending ? "Confirming Approval..." : isConfirmingApprove ? "Processing Approval..." : "Approve USDC"}
                        </Button>
                    )}
                </div>

                {hash && <div className="p-3 rounded bg-green-500/10 border border-green-500/20 text-xs text-green-400 break-all">Create Tx: {hash}</div>}
                {approveHash && <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 break-all">Approve Tx: {approveHash}</div>}
                {isConfirmedCreate && <div className="text-center text-green-500 font-bold text-lg">Market Created Successfully!</div>}
            </form>
        </Form>
    )
}
