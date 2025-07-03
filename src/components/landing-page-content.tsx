"use client"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { ArrowRight, Shield, Clock, BarChart3 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

interface LandingPageContentProps {
  user: any
}

export function LandingPageContent({ user }: LandingPageContentProps) {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center space-y-8 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            {t('landing.hero.title')}
            <span className="block text-primary">{t('landing.hero.subtitle')}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t('landing.hero.description')}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  {t('nav.dashboard')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    {t('landing.hero.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    {t('nav.login')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="container py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t('landing.features.title')}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('landing.features.secure.title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.features.secure.description')}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('landing.features.reminders.title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.features.reminders.description')}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('landing.features.dashboard.title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.features.dashboard.description')}
              </p>
            </div>
          </div>
        </section>

        <section className="container py-24 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-3xl font-bold">{t('landing.cta.title')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.cta.description')}
            </p>
            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  {t('landing.cta.button')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2024 {t('common.appName')}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}