export interface Outcome {
    name: string
    probability: number
}

export interface Market {
    id: string
    title: string
    image: string
    type: "binary"
    outcomes: Outcome[]
    volume: string
    tag?: string
    startTime?: number
    endTime?: number
    resolved?: boolean
    yesWon?: boolean
    description?: string
    resolutionSource?: string
    startDate?: string
    endDate?: string
    category?: string
}