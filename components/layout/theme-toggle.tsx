"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className={cn("h-8 w-14 rounded-full bg-muted", className)} />
    }

    const isDark = theme === "dark"

    return (
        <div
            className={cn(
                "relative flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300",
                isDark ? "bg-zinc-800" : "bg-zinc-200",
                className
            )}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            <motion.div
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                animate={{
                    x: isDark ? 24 : 0,
                    rotate: isDark ? 360 : 0
                }}
            >
                <motion.div
                    key={isDark ? "moon" : "sun"}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isDark ? (
                        <Moon className="h-3.5 w-3.5 text-blue-500 fill-blue-500/20" />
                    ) : (
                        <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                    )}
                </motion.div>
            </motion.div>
            <span className="sr-only">Toggle theme</span>
        </div>
    )
}
