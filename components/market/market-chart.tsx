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
        if (!data || data.length === 0) {
            return [
                { date: 'Start', probability: 0 },
                { date: '', probability: 0 },
                { date: 'End', probability: 0 }
            ]
        }

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

    const startProb = chartData[0].probability
    const endProb = chartData[chartData.length - 1].probability
    const isPositive = endProb >= startProb
    const color = isPositive ? "#10b981" : "#ef4444"

    return (
        <div className="w-full">
            <div className="mb-4 flex items-baseline gap-3">
                <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-3xl font-bold text-foreground">{endProb}%</span>
                    <span className="text-xs md:text-sm font-medium text-muted-foreground">chance</span>
                </div>
            </div>

            <div className="h-[200px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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
                            tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                            minTickGap={40}
                        />
                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                            tickFormatter={(value) => `${value}%`}
                            orientation="right"
                            tickMargin={0}
                            width={35}
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
                        className={`cursor-not-allowed rounded px-3 py-1 text-[10px] font-medium transition-colors ${range === 'All'
                            ? 'bg-secondary text-primary'
                            : 'text-muted-foreground opacity-50'
                            }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div >
    )
}
