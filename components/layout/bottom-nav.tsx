"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusCircle, Wallet } from "lucide-react"
import { motion } from "framer-motion"

import { useUserRights } from "@/hooks/useUserRights"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()
    const { hasCreationRights, isConnected } = useUserRights()

    const links = [
        {
            href: "/",
            label: "Home",
            icon: Home,
            show: true
        },
        {
            href: "/create-market",
            label: "Create",
            icon: PlusCircle,
            show: isConnected && hasCreationRights
        },
        {
            href: "/wallet",
            label: "Wallet",
            icon: Wallet,
            show: true
        }
    ]

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full md:hidden">
            <div className="mx-4 mb-2 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
                <div className="flex h-14 items-center justify-center gap-12 px-6">
                    {links.filter(l => l.show).map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative flex flex-col items-center justify-center gap-1"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute -top-3 h-1 w-8 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={cn(
                                    "flex flex-col items-center gap-1 transition-colors duration-200",
                                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                                )}>
                                    <Icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">{link.label}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
