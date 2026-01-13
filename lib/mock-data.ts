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

export const mockMarkets: Market[] = [
  {
    id: "1",
    title: "Khamenei out as Supreme Leader of Iran by January 31?",
    image: "/iran.jpg",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 18 },
      { name: "No", probability: 82 },
    ],
    volume: "6",
  },
  {
    id: "2",
    title: "Will Trump acquire Greenland before 2027?",
    image: "/greenland.jpg",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 16 },
      { name: "No", probability: 84 },
    ],
    volume: "4",
  },
  {
    id: "3",
    title: "Israel strikes Iran by January 31, 2026?",
    image: "/israel-iran.jpg",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 32 },
      { name: "No", probability: 68 },
    ],
    volume: "5",
  },
  {
    id: "4",
    title: "Elon Musk # tweets January 2 - January 9, 2026?",
    image: "/elon-musk-portrait.png",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 70 },
      { name: "No", probability: 30 },
    ],
    volume: "16",
  },
  {
    id: "5",
    title: "US strikes Iran by...?",
    image: "/us-iran.jpg",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 6 },
      { name: "No", probability: 94 },
    ],
    volume: "4",
  },
  {
    id: "6",
    title: "Super Bowl Champion 2026",
    image: "/super-bowl-atmosphere.png",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 19 },
      { name: "No", probability: 81 },
    ],
    volume: "661",
  },
  {
    id: "7",
    title: "Will Venezuelan regime fall before 2027?",
    image: "/venezuela.jpg",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 40 },
      { name: "No", probability: 60 },
    ],
    volume: "2",
  },
  {
    id: "8",
    title: "Portugal Presidential Election",
    image: "/portugal-election.jpg",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 42 },
      { name: "No", probability: 58 },
    ],
    volume: "94",
  },
  {
    id: "9",
    title: "Presidential Election Winner 2028",
    image: "/2028-election.jpg",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 28 },
      { name: "No", probability: 72 },
    ],
    volume: "178",
  },
  {
    id: "10",
    title: "S&P 500 (SPX) Up or Down on January 9?",
    image: "/stock-market-analysis.png",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 66 },
      { name: "No", probability: 34 },
    ],
    volume: "14",
    tag: "repeat-3",
  },
  {
    id: "11",
    title: "Bitcoin above ___ on January 9?",
    image: "/bitcoin-concept.png",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 50 },
      { name: "No", probability: 50 },
    ],
    volume: "4",
  },
  {
    id: "12",
    title: "Will Silver (SI) hit__ by end of January?",
    image: "/silver-commodity.png",
    type: "binary",
    outcomes: [
      { name: "Yes", probability: 7 },
      { name: "No", probability: 93 },
    ],
    volume: "2",
  },
]
