"use client"

import Link from "next/link"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Search, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useUserRights } from "@/hooks/useUserRights"

export default function Header() {
  const { hasCreationRights, isConnected } = useUserRights()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Precast</span>
        </Link>

        {/* Search Bar - Hidden on mobile, distinct on desktop */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets (e.g. Crypto, Politics, Sports)..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all hover:bg-white/10 focus:border-primary/50 focus:bg-white/10 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {isConnected && hasCreationRights && (
             <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex border-primary/20 hover:bg-primary/10 hover:text-primary">
              <Link href="/create-market">Create Market</Link>
            </Button>
          )} 
          
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button onClick={openConnectModal} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                          Connect Wallet
                        </Button>
                      );
                    }
                    if (chain.unsupported) {
                      return (
                        <Button onClick={openChainModal} variant="destructive" size="sm">
                          Wrong network
                        </Button>
                      );
                    }
                    return (
                      <div className="flex items-center gap-2">
                         <button
                          onClick={openChainModal}
                          className="hidden items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10 sm:flex"
                          type="button"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 18,
                                height: 18,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 18, height: 18 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>
                        <button
                          onClick={openAccountModal}
                          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 pl-2 pr-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10"
                          type="button"
                        >
                           <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-primary to-accent" />
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
      
      {/* Mobile Search - Visible only on mobile */}
      <div className="border-t border-white/5 px-4 py-3 md:hidden bg-background/95 backdrop-blur-xl">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
      </div>
    </header>
  )
}
