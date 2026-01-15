import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import {
    baseSepolia
} from 'wagmi/chains';

// SSR-safe fallback config (no connectors that use indexedDB)
let ssrConfigInstance: ReturnType<typeof createConfig> | null = null;

// Client-side config with connectors
let clientConfigInstance: ReturnType<typeof createConfig> | null = null;

// Get SSR-safe config (no indexedDB dependencies)
export const getSSRConfig = () => {
    if (!ssrConfigInstance) {
        ssrConfigInstance = createConfig({
            chains: [baseSepolia],
            connectors: [], // No connectors during SSR to avoid indexedDB
            transports: {
                [baseSepolia.id]: http(),
            },
            ssr: true,
        });
    }
    return ssrConfigInstance;
};

// Get client-side config with connectors
export const getConfig = () => {
    if (typeof window === 'undefined') {
        // During SSR, return SSR-safe config
        return getSSRConfig();
    }
    
    if (!clientConfigInstance) {
        // Only use injected connector since Privy handles wallet connections
        // WalletConnect connector uses indexedDB which causes SSR issues
        clientConfigInstance = createConfig({
            chains: [baseSepolia],
            connectors: [
                injected(),
            ],
            transports: {
                [baseSepolia.id]: http(),
            },
            ssr: true,
        });
    }
    return clientConfigInstance;
};
