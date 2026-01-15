import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatEther } from "viem"

interface ChartData {
    priceYES: string
    blockTimestamp?: string
}

interface MarketChartProps {
    data?: ChartData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value
        return (
            <div className="rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
                <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].stroke }} />
                    <span className="text-sm font-bold text-foreground">
                        {value}% Chance
                    </span>
                </div>
            </div>
        )
    }
    return null
}

export function MarketChart({ data }: MarketChartProps) {
    const chartData = React.useMemo(() => {
        if (!data || data.length === 0) return []

        return data.map((item, index) => {
            const probability = Number(formatEther(BigInt(item.priceYES))) * 100

            let date = `Trade ${index + 1}`
            if (item.blockTimestamp) {
                date = new Date(Number(item.blockTimestamp) * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }

            return {
                date,
                probability: Number(probability.toFixed(1))
            }
        })
    }, [data])

    if (!chartData || chartData.length === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
                No trading data available
            </div>
        )
    }

    const startProb = chartData[0].probability
    const endProb = chartData[chartData.length - 1].probability
    const isPositive = endProb >= startProb
    const color = isPositive ? "#10b981" : "#ef4444"

    return (
        <div className="w-full">
            <div className="mb-4 flex items-baseline gap-3">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{endProb}%</span>
                    <span className="text-sm font-medium text-muted-foreground">chance</span>
                </div>
                <span className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(endProb - startProb).toFixed(1)}%
                    <span className="ml-1 text-muted-foreground">vs start</span>
                </span>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                            minTickGap={40}
                        />
                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                            tickFormatter={(value) => `${value}%`}
                            orientation="right"
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }} />
                        <Area
                            type="stepAfter" // stepAfter is often good for price history, or linear
                            dataKey="probability"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorProbability)"
                            activeDot={{ r: 4, fill: color, stroke: 'white', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Time Range Selectors - could implement filtering logic later */}
            <div className="mt-4 flex justify-end gap-1">
                {['1H', '6H', '1D', '1W', '1M', 'All'].map((range) => (
                    <button
                        key={range}
                        disabled
                        className={`cursor-not-allowed rounded px-3 py-1 text-xs font-medium transition-colors ${range === 'All'
                            ? 'bg-secondary text-primary'
                            : 'text-muted-foreground opacity-50'
                            }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
    )
}
