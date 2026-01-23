import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { FAUCET_ADDRESS } from "@/lib/constants";
import FAUCET_ABI from "@/lib/FAUCET_ABI.json";

export async function POST(req: NextRequest) {
    try {
        const { address } = await req.json();

        if (!address) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            );
        }

        const privateKey = process.env.FAUCET_PRIVATE_KEY;

        if (!privateKey) {
            console.error("FAUCET_PRIVATE_KEY is not configured");
            return NextResponse.json(
                { error: "Faucet configuration error" },
                { status: 500 }
            );
        }

        const account = privateKeyToAccount(privateKey as `0x${string}`);

        const client = createWalletClient({
            account,
            chain: baseSepolia,
            transport: http(),
        });

        const hash = await client.writeContract({
            address: FAUCET_ADDRESS as `0x${string}`,
            abi: FAUCET_ABI,
            functionName: "claimEth",
            args: [address],
        });

        return NextResponse.json({ success: true, hash });
    } catch (error) {
        console.error("Error sending ETH:", error);
        return NextResponse.json(
            { error: "Failed to send ETH" },
            { status: 500 }
        );
    }
}
