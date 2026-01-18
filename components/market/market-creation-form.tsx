"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAccount, useReadContract } from "wagmi"
import { parseEther, parseUnits, encodeFunctionData, type Address } from "viem"
import { baseSepolia } from "wagmi/chains"
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
import { uploadJSONToIPFS } from "@/lib/ipfs"
import { useEffect, useState } from "react"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { uploadFileToCloudinary } from "@/lib/claudinary"
import { usePrivy, useSendTransaction, useWallets } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    question: z.string().min(10, {
        message: "Question must be at least 10 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),

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
    const router = useRouter()
    const { address } = useAccount()
    const { authenticated, login, ready, user } = usePrivy()
    
    const { sendTransaction } = useSendTransaction()
    const { wallets } = useWallets()
    
    const walletAddress = address || (user?.wallet?.address as `0x${string}` | undefined)
    const wallet = wallets?.[0] 
    
    
    const [approveHash, setApproveHash] = useState<string | null>(null)
    const [isApprovePending, setIsApprovePending] = useState(false)
    const [createHash, setCreateHash] = useState<string | null>(null)
    const [isCreatePending, setIsCreatePending] = useState(false)
    const [createStep, setCreateStep] = useState<string>("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: "",
            description: "",
            category: "",
            customCategory: "",
            resolutionSource: "",
            liquidity: 100,
          
        },
    })

    const liquidity = form.watch("liquidity")
    const imageFile = form.watch("image")
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    
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
            }, 2000)
        }
    }, [approveHash, isApprovePending, refetchAllowance])

    const isAllowanceSufficient = allowance ? allowance >= parseEther(liquidity.toString()) : false

    async function handleApprove() {
        // Check if Privy is ready
        if (!ready) {
            toast.error("Wallet is initializing, please wait...")
            return
        }

        // Check if user is authenticated via Privy
        if (!authenticated) {
            toast.info("Please connect your wallet first")
            login()
            return
        }

        // Check if we have a wallet
        if (!wallet || !walletAddress) {
            toast.error("Wallet not available. Please reconnect your wallet.")
            return
        }

        try {
            setIsApprovePending(true)
            
            // Encode the approve function call
            const approveAmount = parseEther(liquidity.toString())
            const data = encodeFunctionData({
                abi: ERC20ABI,
                functionName: "approve",
                args: [CONTRACT_ADDRESS as Address, approveAmount],
            })

            // Send transaction using Privy
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Submitting form...", values);
        
        // Check if Privy is ready
        if (!ready) {
            toast.error("Wallet is initializing, please wait...")
            return
        }

       
        if (!authenticated) {
            toast.info("Please connect your wallet first")
            login()
            return
        }

        if (!walletAddress) {
            toast.error("Wallet address not available. Please reconnect your wallet.")
            return
        }

        if (!isAllowanceSufficient) {
            handleApprove();
            return;
        }

        try {
            setIsCreatePending(true)
            setCreateStep("Uploading image...")
            
            // 1. Upload Image
            let imageUrl = "";
            if (values.image instanceof File) {
                const imageToast = toast.loading("Uploading image to Cloudinary...");
                console.log("📤 Uploading image to Cloudinary:", {
                    fileName: values.image.name,
                    fileSize: values.image.size,
                    fileType: values.image.type,
                });
                
                try {
                    imageUrl = await uploadFileToCloudinary(values.image);
                    
                    console.log("✅ Image successfully uploaded to Cloudinary!");
                    console.log("🔗 Cloudinary URL:", imageUrl);
                    
                
                    toast.dismiss(imageToast);
                    toast.success("Image uploaded successfully!");
                } catch (error) {
                    toast.dismiss(imageToast);
                    console.error("Cloudinary Image Error:", error);
                    toast.error("Failed to upload image. Check your API keys.");
                    setIsCreatePending(false);
                    setCreateStep("");
                    return;
                }
            } else {
                console.warn(" No image file provided or invalid type", values.image);
            }

            // 2. Upload Metadata
            setCreateStep("Uploading metadata...")
            const metadataToast = toast.loading("Uploading metadata to IPFS...");
            const metadata = {
                question: values.question,
                description: values.description,
                image: imageUrl,
                imageSource: "cloudinary",
                category: values.category === "Other" && values.customCategory ? values.customCategory : values.category,
                resolutionSource: values.resolutionSource
            };

            console.log("Metadata: ", metadata);

            let metadataCid = "";
            try {
                metadataCid = await uploadJSONToIPFS(metadata);
                toast.dismiss(metadataToast);
                toast.success(" Metadata uploaded successfully!");
            } catch (error) {
                toast.dismiss(metadataToast);
                console.error("IPFS Metadata Error:", error);
                toast.error("Failed to upload metadata. Check your API keys.");
                setIsCreatePending(false);
                setCreateStep("");
                return;
            }

            // 3. Create Market
            setCreateStep("Creating market...")
            const createToast = toast.loading("Creating market on blockchain...");
            
           
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

           
            if (!wallet || !walletAddress) {
                toast.dismiss(createToast);
                toast.error("Wallet not available. Please reconnect your wallet.")
                setIsCreatePending(false);
                setCreateStep("");
                return
            }

           
            const createMarketData = encodeFunctionData({
                abi: LMSRABI as any,
                functionName: 'createMarket',
                args: [
                    parseUnits(values.liquidity.toString(), 6), // _b
                    BigInt(startTime),
                    BigInt(endTime),
                    values.question,
                    metadataCid // _cId
                ],
            })

            // Send transaction using Privy
            const { hash: createHash } = await sendTransaction(
                {
                    to: CONTRACT_ADDRESS as Address,
                    data: createMarketData,
                    chainId: baseSepolia.id,
                },
                {
                    address: wallet.address as `0x${string}`,
                }
            )

            setCreateHash(createHash)
            toast.dismiss(createToast);
            toast.success("🎉 Market created successfully! Transaction sent to blockchain.")
            setIsCreatePending(false)
            setCreateStep("")
            
            form.reset({
                question: "",
                description: "",
                category: "",
                customCategory: "",
                resolutionSource: "",
                liquidity: 100,
                image: undefined,
                startDate: undefined,
                endDate: undefined,
            })
            setImagePreview(null)
            
            setTimeout(() => {
                router.push("/")
            }, 2000)
        } catch (error) {
            console.error("Create Market Error:", error)
            setIsCreatePending(false)
            setCreateStep("")
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
                                    <Textarea placeholder="Provide context and resolution criteria..." {...field} className="min-h-25 bg-secondary border-border text-foreground" />
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
                        <Button type="submit" disabled={isCreatePending} className="w-full text-base font-semibold h-12">
                            {isCreatePending ? (createStep || "Processing...") : "Create Market"}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleApprove}
                            disabled={isApprovePending}
                            className="w-full font-semibold h-12 bg-emerald-600 text-white hover:bg-emerald-700"
                            variant="default"
                        >
                            {isApprovePending ? "Processing Approval..." : "Approve USDC"}
                        </Button>
                    )}
                </div>

                {createHash && <div className="p-3 rounded bg-green-500/10 border border-green-500/20 text-xs text-green-400 break-all">Create Tx: {createHash}</div>}
                {approveHash && <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 break-all">Approve Tx: {approveHash}</div>}
                {createHash && !isCreatePending && <div className="text-center text-green-500 font-bold text-lg">Market Creation Transaction Sent!</div>}
            </form>
        </Form>
    )
}
