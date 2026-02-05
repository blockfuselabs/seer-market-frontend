"use client"

import { ArrowDownLeft, ArrowUpRight, Clock, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data
const transactions = [
    {
        id: "1",
        type: "receive",
        asset: "ETH",
        amount: "0.45",
        value: "$1,240.50",
        date: "Today, 10:23 AM",
        status: "Completed",
        address: "0x7a...2b1a"
    },
    {
        id: "2",
        type: "send",
        asset: "USDC",
        amount: "500.00",
        value: "$500.00",
        date: "Yesterday, 4:15 PM",
        status: "Completed",
        address: "0x3f...8e9d"
    },
    {
        id: "3",
        type: "receive",
        asset: "ETH",
        amount: "1.2",
        value: "$3,410.12",
        date: "Jan 24, 9:00 AM",
        status: "Completed",
        address: "0x1c...5f21"
    },
    {
        id: "4",
        type: "send",
        asset: "ETH",
        amount: "0.1",
        value: "$285.00",
        date: "Jan 22, 2:30 PM",
        status: "Pending",
        address: "0x9d...3a4b"
    },
    {
        id: "5",
        type: "receive",
        asset: "USDC",
        amount: "1250.00",
        value: "$1,250.00",
        date: "Jan 20, 11:45 AM",
        status: "Completed",
        address: "0x5e...1c8f"
    }
]

export function TransactionHistory() {
    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
            </div>

            <div className="relative flex-1 rounded-3xl border border-border/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-xl dark:border-white/10 flex flex-col">
                {/* Header/Filter placeholder */}
                <div className="p-4 border-b border-border/5 dark:border-white/5 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full bg-black/5 dark:bg-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-foreground dark:text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'receive'
                                            ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'
                                            : 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400'
                                        }`}>
                                        {tx.type === 'receive' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground dark:text-white/90">
                                            {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.asset}
                                        </span>
                                        <span className="text-xs text-muted-foreground dark:text-white/50">{tx.date}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className={`text-sm font-bold ${tx.type === 'receive'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-foreground dark:text-white/90'
                                        }`}>
                                        {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.asset}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground dark:text-white/50">{tx.value}</span>
                                        {tx.status === 'Pending' && (
                                            <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
