"use client"

import { Package2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButtons } from "@/components/auth/auth-buttons"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { useTranslations } from "next-intl"

export function Header() {
  const t = useTranslations()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Package2 className="h-6 w-6" />
          <span className="text-xl font-bold">{t('common.appName')}</span>
        </Link>
        <div className="flex items-center space-x-4">
          <LocaleSwitcher />
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}