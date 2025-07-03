'use client'

import { useTranslation } from "react-i18next"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface OverdueAlertWrapperProps {
  overdueCount: number
  mostOverdueItem: string
  daysOverdue: number
}

export function OverdueAlertWrapper({ overdueCount, mostOverdueItem, daysOverdue }: OverdueAlertWrapperProps) {
  const { t } = useTranslation()

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t('dashboard.overdueAlert.title')}</AlertTitle>
      <AlertDescription>
        {t('dashboard.overdueAlert.description', { count: overdueCount })}
        {' '}<strong>{mostOverdueItem}</strong> {t('dashboard.overdueAlert.daysOverdue', { days: daysOverdue })}
        {' '}
        <Link href="/loans?filter=overdue" className="underline font-medium">
          {t('dashboard.overdueAlert.viewAll')}
        </Link>
      </AlertDescription>
    </Alert>
  )
}