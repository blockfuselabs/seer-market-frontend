import { useReadContract } from "wagmi"
import { CONTRACT_ADDRESS } from "@/lib/constants"
import LMSRABI from "@/lib/LMSRABI.json"
import { Market } from "@/lib/mock-data"
import { formatEther } from "viem"
import { useEffect, useState } from "react"
import { fetchIPFSMetadata, getIPFSUrl } from "@/lib/ipfs"

export function useMarket(marketId: string) {
    const id = BigInt(marketId)

    // 1. Fetch Market Data
    const { data: marketData, isLoading: isLoadingMarket } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: LMSRABI as any,
        functionName: "markets",
        args: [id],
    })

    // 2. Fetch Price
    const { data: priceData, isLoading: isLoadingPrice } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: LMSRABI as any,
        functionName: "priceYES",
        args: [id],
    })

    // 3. Fetch Metadata
    const [metadata, setMetadata] = useState<any>(null)
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

    useEffect(() => {
        if (!marketData) return

        const fetchMetadata = async () => {
            // marketData is [exists, b, qYes, qNo, startTime, endTime, resolved, yesWon, question, cId]
            const data = marketData as any
            const cId = data[9] || data.cId

            if (!cId) return

            setIsLoadingMetadata(true)
            const meta = await fetchIPFSMetadata(cId)
            setMetadata(meta)
            setIsLoadingMetadata(false)
        }

        fetchMetadata()
    }, [marketData])

    // 4. Transform Data
    let market: Market | null = null

    if (marketData) {
        const data = marketData as any
        const question = data[8] || data.question
        const cId = data[9] || data.cId

        // Parse Price
        let probability = 50
        if (priceData) {
            const priceWei = priceData as bigint
            probability = parseFloat(formatEther(priceWei)) * 100
        }

        // Image
        let imageUrl = "/bitcoin-concept.png"
        if (metadata?.image) {
            imageUrl = getIPFSUrl(metadata.image)
        } else if (cId && cId.includes("TestImageCid")) {
            imageUrl = "/super-bowl-atmosphere.png"
        }

        market = {
            id: marketId,
            title: question,
            image: imageUrl,
            type: "binary",
            outcomes: [
                { name: "Yes", probability: Math.round(probability) },
                { name: "No", probability: 100 - Math.round(probability) },
            ],
            volume: "0", // Placeholder
            tag: "Crypto", // Placeholder
            description: metadata?.description || "",
            resolutionSource: metadata?.resolutionSource || "",
            startDate: data[4] ? new Date(Number(data[4]) * 1000).toLocaleString() : "",
            endDate: data[5] ? new Date(Number(data[5]) * 1000).toLocaleString() : "",
            startTime: data[4] ? Number(data[4]) : undefined,
            endTime: data[5] ? Number(data[5]) : undefined
        } as Market & { description?: string, resolutionSource?: string, startDate?: string, endDate?: string }
    }

    return {
        market,
        isLoading: isLoadingMarket || isLoadingPrice || isLoadingMetadata
    }
}
