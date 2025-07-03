'use client'

import { useTranslation } from "react-i18next"

interface DashboardHeaderProps {
  userEmail: string
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const { t } = useTranslation()
  
  // Extract username from email for display
  const displayName = userEmail ? userEmail.split('@')[0] : userEmail

  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
      <p className="text-muted-foreground">
        {t('dashboard.welcome', { name: displayName })}
      </p>
    </div>
  )
}