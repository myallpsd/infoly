import type { Metadata } from "next"
import { Geist, Geist_Mono, Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { ToastProvider } from "@/components/ui/toast-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import "./globals.css"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Infoly",
  description: "Secure wiki dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  )
}
