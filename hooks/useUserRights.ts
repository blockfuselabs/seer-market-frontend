'use client';

import { useReadContracts } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import LMSRABI from "@/lib/LMSRABI.json";
import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from "react";

export function useUserRights() {
    const { ready, authenticated, user } = usePrivy();

    const isConnected = ready && authenticated;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const address = user?.wallet?.address;

    const result = useReadContracts({
        contracts: [
            {
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: LMSRABI,
                functionName: "DEFAULT_ADMIN_ROLE",
            },
            {
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: LMSRABI,
                functionName: "MODERATOR_ROLE",
            },
        ],
        query: {
            enabled: mounted,
        }
    });

    const adminRole = result.data?.[0]?.result;
    const moderatorRole = result.data?.[1]?.result;

    const { data: roles } = useReadContracts({
        contracts: [
            {
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: LMSRABI,
                functionName: "hasRole",
                args: [adminRole as string, address as string],
            },
            {
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: LMSRABI,
                functionName: "hasRole",
                args: [moderatorRole as string, address as string],
            },
        ],
        query: {
            enabled: !!address && !!adminRole && !!moderatorRole,
        }
    });

    const isAdmin = roles?.[0]?.result ?? false;
    const isModerator = roles?.[1]?.result ?? false;
    const hasCreationRights = isAdmin || isModerator;

    return {
        isConnected,
        isAdmin,
        isModerator,
        hasCreationRights,
        isLoading: result.isLoading,
    };
}
