"use client"

import Link from "next/link"
import { usePrivy } from '@privy-io/react-auth';
import { Search, Trophy, Menu, Home, PlusCircle, LogOut, Copy, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBalance, useReadContract } from "wagmi"
import { ThemeToggle } from "./theme-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useUserRights } from "@/hooks/useUserRights"
import { toast } from "sonner";
import { erc20Abi } from "viem";
import { USDC_ADDRESS } from "@/lib/constants";
import { useFaucet } from "@/hooks/useFaucet";

export default function Header() {
  const { hasCreationRights } = useUserRights()
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { claimEth, claimTokens, hasClaimedEth, canClaimTokens, isClaiming } = useFaucet();

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: user?.wallet?.address as `0x${string}`,
  });
  const { data: erc20Amount, refetch: refetchUSDC } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: user?.wallet?.address ? [user.wallet.address as `0x${string}`] : undefined,
    query: {
      enabled: !!user?.wallet?.address,
    }
  });

  console.log(`Amount`, erc20Amount);

  const claimETHFaucet = async () => {
    try {
      if (hasClaimedEth) {
        console.log("You have already claimed ETH from the faucet.");
        toast.error("You have already claimed ETH from the faucet.");
        return;
      }
      toast.info("Claiming ETH...");
      console.log("Claiming ETH...");
      await claimEth();
      console.log("ETH claimed successfully!");
      toast.success("ETH claimed successfully!");
      refetchBalance(); // Refresh ETH balance
    } catch (error) {
      console.error("Failed to claim ETH:", error);
      toast.error("Failed to claim ETH. Please try again.");
    }
  };

  const claimUSDCFaucet = async () => {
    try {
      if (!canClaimTokens) {
        toast.error("You need to wait 24 hours between token claims.");
        return;
      }
      toast.info("Claiming USDC...");
      await claimTokens();
      toast.success("USDC claimed successfully!");
      refetchUSDC(); // Refresh USDC balance
    } catch (error) {
      console.error("Failed to claim USDC:", error);
      toast.error("Failed to claim USDC. Please try again.");
    }
  };

  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

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
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <ThemeToggle className="h-8 w-8 md:h-9 md:w-9" />

          {authenticated && hasCreationRights && (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex border-border hover:bg-secondary hover:text-foreground">
              <Link href="/create-market">Create Market</Link>
            </Button>
          )}

          {/* Privy Login/Logout */}
          {!authenticated ? (
            <>
              <Button
                onClick={login}
                disabled={disableLogin}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-none"
              >
                Login
              </Button>
              <Button
                onClick={login}
                disabled={disableLogin}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-none"
              >
                Signup
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors hover:bg-secondary/80">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-primary to-primary/50" />
                  <span className="text-foreground">
                    {user?.email?.address ||
                      user?.wallet?.address?.slice(0, 6) + '...' + user?.wallet?.address?.slice(-4) ||
                      'User'}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (user?.wallet?.address) {
                      navigator.clipboard.writeText(user.wallet.address);
                      toast.success('Address copied to clipboard');
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="opacity-100">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>
                    {balanceData ? `${Number(Number(balanceData.value) / 10e17).toFixed(4)} ${balanceData.symbol}` : 'Loading...'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="opacity-100">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>
                    {erc20Amount !== undefined ? `${Number(Number(erc20Amount) / 10e5).toFixed(2)} USDC` : 'Loading...'}
                  </span>
                </DropdownMenuItem>
                {balanceData && Number(balanceData.value) == 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={claimETHFaucet}
                      disabled={isClaiming || hasClaimedEth}
                      className={`cursor-pointer ${(isClaiming || hasClaimedEth) ? 'opacity-50' : ''}`}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>{hasClaimedEth ? 'Eth Claimed' : 'Claim Faucet (ETH)'}</span>
                    </DropdownMenuItem>
                  </>
                ) : null}
                {erc20Amount !== undefined && Number(erc20Amount) == 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={claimUSDCFaucet}
                      disabled={isClaiming || !canClaimTokens}
                      className={`cursor-pointer ${(isClaiming || !canClaimTokens) ? 'opacity-50' : ''}`}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>{!canClaimTokens ? 'Cooldown Active' : 'Claim Faucet (USDC)'}</span>
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/wallet">
                    <Wallet className="mr-2 h-4 w-4" />
                    Manage Wallet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
                {authenticated && user && (
                  <div className="flex flex-col gap-3 px-4 py-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-primary/50" />
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
                            {user?.email?.address ||
                              user?.wallet?.address?.slice(0, 6) + '...' + user?.wallet?.address?.slice(-4) ||
                              'User'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          if (user?.wallet?.address) {
                            navigator.clipboard.writeText(user.wallet.address);
                            toast.success('Address copied to clipboard');
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Wallet className="h-3 w-3" /> ETH
                        </span>
                        <span className="font-medium">
                          {balanceData ? `${Number(Number(balanceData.value) / 10e17).toFixed(4)} ${balanceData.symbol}` : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Wallet className="h-3 w-3" /> USDC
                        </span>
                        <span className="font-medium">
                          {erc20Amount !== undefined ? `${Number(Number(erc20Amount) / 10e5).toFixed(2)} USDC` : 'Loading...'}
                        </span>
                      </div>
                      {balanceData && Number(balanceData.value) == 0 && (
                        <div
                          className={`flex items-center justify-between text-sm cursor-pointer hover:opacity-80 ${(isClaiming || hasClaimedEth) ? 'opacity-50' : ''}`}
                          onClick={claimETHFaucet}
                        >
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Wallet className="h-3 w-3" /> ETH Faucet
                          </span>
                          <span className="font-medium text-primary">
                            {hasClaimedEth ? 'Claimed' : 'Claim'}
                          </span>
                        </div>
                      )}

                      {erc20Amount !== undefined && Number(erc20Amount) == 0 && (
                        <div
                          className={`flex items-center justify-between text-sm cursor-pointer hover:opacity-80 ${(isClaiming || !canClaimTokens) ? 'opacity-50' : ''}`}
                          onClick={claimUSDCFaucet}
                        >
                          <span className="text-muted-foreground flex items-center gap-1">
                            USDC Faucet
                          </span>
                          <span className="font-medium text-primary">
                            {!canClaimTokens ? 'Cooldown' : 'Claim'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-foreground">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Home</span>
                </Link>

                {authenticated && hasCreationRights && (
                  <Link href="/create-market" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-foreground">
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-medium">Create Market</span>
                  </Link>
                )}

                {authenticated && (
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full justify-start gap-3 px-4"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </Button>
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