"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
    const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date)

    // Sync internal state with prop
    React.useEffect(() => {
        setSelectedDateTime(date)
    }, [date])

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const newDateTime = new Date(selectedDate)
            if (selectedDateTime) {
                newDateTime.setHours(selectedDateTime.getHours())
                newDateTime.setMinutes(selectedDateTime.getMinutes())
            } else {
                // Default to current time or 12:00 if no time set
                const now = new Date()
                newDateTime.setHours(now.getHours())
                newDateTime.setMinutes(now.getMinutes())
            }
            setSelectedDateTime(newDateTime)
            setDate(newDateTime)
        } else {
            setSelectedDateTime(undefined)
            setDate(undefined)
        }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeValue = e.target.value
        if (!timeValue) return

        const [hours, minutes] = timeValue.split(":").map(Number)
        const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date()

        newDateTime.setHours(hours)
        newDateTime.setMinutes(minutes)

        setSelectedDateTime(newDateTime)
        setDate(newDateTime)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal border-border bg-secondary hover:bg-secondary/80",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP p") : <span>Pick a date and time</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-border bg-card" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDateTime}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                />
                <div className="p-3 border-t border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="time"
                            className="h-8 border-border bg-background focus-visible:ring-emerald-500"
                            value={selectedDateTime ? format(selectedDateTime, "HH:mm") : ""}
                            onChange={handleTimeChange}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
