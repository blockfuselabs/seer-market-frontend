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
import { config } from '@/lib/wagmi';

import { ThemeProvider } from "@/components/theme-provider"

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
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
    );
}
