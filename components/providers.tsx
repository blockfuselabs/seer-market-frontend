'use client';
import * as React from 'react';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import {
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { PrivyProvider } from '@privy-io/react-auth';
import { config } from '@/lib/wagmi';
import { ThemeProvider } from "@/components/theme-provider"

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
         appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
         clientId = {process.env.NEXT_PUBLIC_PRIVY_SIGNER_ID}
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
                defaultChain: config.chains[0],
                // Supported chains
                supportedChains: config.chains,
            }}
        >
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <RainbowKitProvider theme={darkTheme({
                            accentColor: '#161616',
                            accentColorForeground: 'white',
                            borderRadius: 'small',
                            fontStack: 'system',
                            overlayBlur: 'small',
                        })}>
                            {children}
                        </RainbowKitProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </PrivyProvider>
    );
}