"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Plus, Search, FileText, BarChart3 } from "lucide-react"

export function QuickActions() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-4">
      <Link href="/loans/new">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('dashboard.quickActions.newLoan')}
        </Button>
      </Link>
      <Link href="/loans">
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          {t('dashboard.quickActions.viewAll')}
        </Button>
      </Link>
      <Link href="/reports">
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          {t('dashboard.quickActions.reports')}
        </Button>
      </Link>
      <Link href="/loans/export">
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          {t('dashboard.quickActions.export')}
        </Button>
      </Link>
    </div>
  )
}