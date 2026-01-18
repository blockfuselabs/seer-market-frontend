'use client';
import * as React from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { PrivyProvider } from '@privy-io/react-auth';
import { getConfig, getSSRConfig } from '@/lib/wagmi';
import { ThemeProvider } from "./theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(() => new QueryClient());
    const [mounted, setMounted] = React.useState(false);
    const [config, setConfig] = React.useState(() => {
        // Initialize with SSR-safe config
        if (typeof window === 'undefined') {
            return getSSRConfig();
        }
        return null;
    });

    React.useEffect(() => {
        setMounted(true);
        // Update to client config once mounted
        if (typeof window !== 'undefined') {
            setConfig(getConfig());
        }
    }, []);

    // Always use a config (SSR-safe initially, then client config)
    const wagmiConfig = config || getSSRConfig();

    // Always render PrivyProvider to avoid "useWallets called outside PrivyProvider" warnings
    // PrivyProvider handles SSR internally and won't cause issues
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            clientId={process.env.NEXT_PUBLIC_PRIVY_SIGNER_ID}
            config={{
                // Appearance
                appearance: {
                    theme: 'dark',
                    accentColor: '#161616',
                },
                // Login methods
                loginMethods: ['email', 'wallet'],
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },
                // Default chain
                defaultChain: wagmiConfig.chains[0],
                // Supported chains
                supportedChains: [...wagmiConfig.chains],
            }}
        >
            <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </PrivyProvider>
    );
}