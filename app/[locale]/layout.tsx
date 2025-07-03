import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { locales } from "@/i18n/config"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Loan Tracker - Personal Loan Management",
  description: "Track and manage your personal loans easily",
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}