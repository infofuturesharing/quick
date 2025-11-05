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
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
