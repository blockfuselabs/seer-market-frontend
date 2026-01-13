"use client"

import Link from "next/link"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Search, Trophy, Menu, Home, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { useUserRights } from "@/hooks/useUserRights"

export default function Header() {
  const { hasCreationRights, isConnected } = useUserRights()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-foreground">Precast</span>
        </Link>

        {/* Search Bar - Hidden on mobile, distinct on desktop */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets (e.g. Crypto, Politics, Sports)..."
              className="w-full rounded-full border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all hover:bg-secondary/80 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <ThemeToggle className="h-8 w-8 md:h-9 md:w-9" />

          {isConnected && hasCreationRights && (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex border-border hover:bg-secondary hover:text-foreground">
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
                        <Button onClick={openConnectModal} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-none">
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
                          className="hidden items-center rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/80 sm:flex"
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
                          className="flex items-center gap-2 rounded-lg border border-border bg-secondary pl-2 pr-3 py-1 md:py-1.5 text-xs md:text-sm font-medium transition-colors hover:bg-secondary/80"
                          type="button"
                        >
                          <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-gradient-to-tr from-primary to-primary/50" />
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          {/* Mobile Hamburger Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-border bg-card">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-bold">Precast</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors text-foreground">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Home</span>
                </Link>
                {isConnected && hasCreationRights && (
                  <Link href="/create-market" className="flex items-center gap-3 px-4 rounded-lg hover:bg-secondary/50 transition-colors text-foreground">
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-medium">Create Market</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 md:hidden bg-background/95 backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search markets..."
            className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </header>
  )
}
