"use client"

import { useReadContract, usePublicClient } from "wagmi"
import { FAUCET_ADDRESS } from "@/lib/constants"
import FAUCET_ABI from "@/lib/FAUCET_ABI.json"
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo, useState } from "react";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

export function useFaucet() {
    const { ready, authenticated, user } = usePrivy();
    const { wallets } = useWallets();
    const publicClient = usePublicClient();
    const [isClaiming, setIsClaiming] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Check if user has already claimed ETH
    const { data: hasClaimedEth } = useReadContract({
        address: FAUCET_ADDRESS as `0x${string}`,
        abi: FAUCET_ABI,
        functionName: "hasClaimedEth",
        args: [user?.wallet?.address as `0x${string}`],
        query: {
            enabled: !!user?.wallet?.address,
        }
    })

    // Check last claimed token time
    const { data: lastClaimedToken } = useReadContract({
        address: FAUCET_ADDRESS as `0x${string}`,
        abi: FAUCET_ABI,
        functionName: "lastClaimedToken",
        args: [user?.wallet?.address as `0x${string}`],
        query: {
            enabled: !!user?.wallet?.address,
        }
    })

    // Get token cooldown
    const { data: tokenCooldown } = useReadContract({
        address: FAUCET_ADDRESS as `0x${string}`,
        abi: FAUCET_ABI,
        functionName: "TOKEN_COOLDOWN",
    })

    const canClaimTokens = useMemo(() => {
        if (!lastClaimedToken || !tokenCooldown) return true;
        const lastClaimed = Number(lastClaimedToken);
        const cooldown = Number(tokenCooldown);
        const now = Math.floor(Date.now() / 1000);
        return now >= lastClaimed + cooldown;
    }, [lastClaimedToken, tokenCooldown]);

    const getWalletClient = async () => {
        const wallet = wallets.find((w) => w.address === user?.wallet?.address);
        if (!wallet) throw new Error("Wallet not found");
        await wallet.switchChain(baseSepolia.id);
        const provider = await wallet.getEthereumProvider();
        return createWalletClient({
            chain: baseSepolia,
            transport: custom(provider),
        });
    };

    const claimEth = async () => {
        if (!user?.wallet?.address) return;
        setIsClaiming(true);
        setIsSuccess(false);
        try {
            const response = await fetch("/api/faucet/claim-eth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ address: user.wallet.address }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to claim ETH");
            }

            // Ideally wait for the transaction to be mined using publicClient if hash is returned
            if (data.hash && publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: data.hash });
            }

            setIsSuccess(true);
            return data.hash;
        } catch (error) {
            console.error("Claim ETH error:", error);
            throw error;
        } finally {
            setIsClaiming(false);
        }
    }

    const claimTokens = async () => {
        if (!user?.wallet?.address || !publicClient) return;
        setIsClaiming(true);
        setIsSuccess(false);
        try {
            const client = await getWalletClient();
            const hash = await client.writeContract({
                address: FAUCET_ADDRESS as `0x${string}`,
                abi: FAUCET_ABI,
                functionName: "claimTokens",
                account: user.wallet.address as `0x${string}`,
            });
            await publicClient.waitForTransactionReceipt({ hash });
            setIsSuccess(true);
            return hash;
        } catch (error) {
            console.error("Claim Tokens error:", error);
            throw error;
        } finally {
            setIsClaiming(false);
        }
    }

    return {
        claimEth,
        claimTokens,
        hasClaimedEth: !!hasClaimedEth,
        canClaimTokens,
        isClaiming,
        isSuccess,
        isLoading: !ready || !authenticated,
    }
}
