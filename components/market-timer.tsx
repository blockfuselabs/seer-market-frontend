"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

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
            <div className="flex items-center gap-2 text-destructive font-semibold bg-destructive/10 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span>Market Expired</span>
            </div>
        )
    }

    if (!timeLeft) return null

    return (
        <div className="flex items-center gap-2 text-orange-500 font-semibold bg-orange-500/10 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <div className="flex gap-1 text-sm">
                <span>{timeLeft.days}d</span>
                <span>{timeLeft.hours}h</span>
                <span>{timeLeft.minutes}m</span>
                <span className="w-5 text-center">{timeLeft.seconds}s</span>
            </div>
        </div>
    )
}
