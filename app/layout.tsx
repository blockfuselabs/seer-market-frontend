import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "@/components/providers"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Precast | The World's Largest Prediction Market",
  description: "Trade on real-world events with Precast - the world's largest prediction market platform",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased pb-24 md:pb-0`}>
        <Providers>
          {children}
          <Footer />
          <BottomNav />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
