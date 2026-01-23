"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

interface MarketTimerProps {
    endTime?: number
}

export function MarketTimer({ endTime }: MarketTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
    } | null>(null)

    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        if (!endTime) return

        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000)
            const difference = endTime - now

            if (difference <= 0) {
                setIsExpired(true)
                setTimeLeft(null)
                return
            }

            const days = Math.floor(difference / (60 * 60 * 24))
            const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60))
            const minutes = Math.floor((difference % (60 * 60)) / 60)
            const seconds = Math.floor(difference % 60)

            setTimeLeft({ days, hours, minutes, seconds })
            setIsExpired(false)
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [endTime])

    if (!endTime) return null

    if (isExpired) {
        return (
            <div className="flex items-center gap-1.5 text-[9px] text-red-500/80 dark:text-red-400 font-medium">
                <div className="relative flex items-center justify-center">
                    <div className="absolute h-2 w-2 rounded-full bg-red-400 animate-ping opacity-75" />
                    <div className="relative h-2 w-2 rounded-full bg-red-400" />
                </div>
                <span>Expired</span>
            </div>
        )
    }

    if (!timeLeft) return null

    return (
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            <span>{format(new Date(endTime * 1000), "d MMM yyyy, h:mma")}</span>
            <span className="text-lg text-black dark:text-white">•</span>
            <div className="flex items-center gap-1.5">
                <div className="relative flex items-center justify-center">
                    <div className="absolute h-2 w-2 rounded-full bg-red-600 dark:bg-red-400 animate-ping opacity-75" />
                    <div className="relative h-2 w-2 rounded-full bg-red-600 dark:bg-red-400" />
                </div>
                <div className="flex gap-0.5">
                    {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
                    <span>{timeLeft.hours}h</span>
                    <span>{timeLeft.minutes}m</span>
                </div>
            </div>
        </div>
    )
}
