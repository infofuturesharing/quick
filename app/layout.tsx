import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/language-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "QuickContact - Find Business Contact Info Instantly",
  description:
    "Quickly find businesses and view their contact information - phone, website, address, rating, and reviews",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isNetlify = process.env.NETLIFY === "true" || process.env.NETLIFY === "1"
  const disableAnalytics = isNetlify || process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "1"
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
        {!disableAnalytics && <Analytics />}
        <Toaster />
      </body>
    </html>
  )
}
