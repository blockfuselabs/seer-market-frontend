"use client"

import { useReadContract, useReadContracts } from "wagmi"
import { CONTRACT_ADDRESS } from "@/lib/constants"
import LMSRABI from "@/lib/LMSRABI.json"
import { Market } from "@/lib/mock-data"
import { formatEther } from "viem"
import { useEffect, useState } from "react"
import { fetchIPFSMetadata, getIPFSUrl } from "@/lib/ipfs"

export function useMarkets() {
    // 1. Fetch total market count
    const { data: marketCount } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: LMSRABI as any,
        functionName: "marketCount",
    })

    // 2. Generate array of indices [0, 1, ..., marketCount-1]
    const count = marketCount ? Number(marketCount) : 0
    console.log('Count', count)
    const marketIds = Array.from({ length: count }, (_, i) => BigInt(i + 1))
    console.log('IDS', marketIds)

    // 3. Batch fetch market data
    const { data: marketsData, isLoading: isLoadingMarkets } = useReadContracts({
        contracts: marketIds.map((id) => ({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: LMSRABI as any,
            functionName: "markets",
            args: [id],
        })),
    })

    // 4. Batch fetch prices (priceYES)
    // Note: Cost to buy 1 full share of YES is roughly the probability
    const { data: pricesData, isLoading: isLoadingPrices } = useReadContracts({
        contracts: marketIds.map((id) => ({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: LMSRABI as any,
            functionName: "priceYES",
            args: [id],
        })),
    })

    // 5. Fetch IPFS Metadata
    const [metadataMap, setMetadataMap] = useState<Record<string, any>>({})

    useEffect(() => {
        if (!marketsData) return

        const fetchAll = async () => {
            const cidsToFetch = new Set<string>()
            marketsData.forEach((result) => {
                if (result.status === "success") {
                    const data = result.result as any
                    const cId = data[9] || data.cId
                    if (cId && !metadataMap[cId]) {
                        cidsToFetch.add(cId)
                    }
                }
            })

            if (cidsToFetch.size === 0) return

            const results = await Promise.all(
                Array.from(cidsToFetch).map(async (cid) => {
                    return { cid, data: await fetchIPFSMetadata(cid) }
                })
            )

            setMetadataMap((prev) => {
                const next = { ...prev }
                let hasUpdates = false
                results.forEach(({ cid, data }) => {
                    if (data && !next[cid]) {
                        next[cid] = data
                        hasUpdates = true
                    }
                })
                return hasUpdates ? next : prev
            })
        }

        fetchAll()
    }, [marketsData, metadataMap])

    // 6. Transform data
    const markets = marketsData?.map((result, index): Market | null => {
        if (result.status !== "success") return null

        index = index + 1

        // result.result matches the struct:
        // [exists, b, qYes, qNo, startTime, endTime, resolved, yesWon, question, cId]
        const data = result.result as any
        const question = data[8] || data.question
        const cId = data[9] || data.cId

        // Parse price
        // Use the original index because pricesData matches marketsData array order
        const originalIndex = index - 1
        const priceResult = pricesData?.[originalIndex]
        let probability = 50
        console.log('Price Result', priceResult)
        if (priceResult?.status === "success") {
            const priceWei = priceResult.result as bigint
            probability = parseFloat(formatEther(priceWei)) * 100
            console.log('Price', probability)
        }

        console.log('Result', result)

        // Mock Metadata Extraction
        let imageUrl = "/bitcoin-concept.png" // Default

        const metadata = metadataMap[cId]
        console.log('Metadata', metadata)
        if (metadata?.image) {
            imageUrl = getIPFSUrl(metadata.image)
        } else if (cId && cId.includes("TestImageCid")) {
            imageUrl = "/super-bowl-atmosphere.png"
        }

        return {
            id: index.toString(),
            title: question,
            image: imageUrl,
            type: "binary",
            outcomes: [
                { name: "Yes", probability: Math.round(probability) },
                { name: "No", probability: 100 - Math.round(probability) },
            ],
            volume: "0",
            tag: "",
        }
    }).filter((m): m is Market => m !== null) || []

    return {
        markets,
        isLoading: isLoadingMarkets || isLoadingPrices,
    }
}
