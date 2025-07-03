'use client'

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function LoansPageHeader() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('loans.pageTitle')}</h1>
        <p className="text-muted-foreground">
          {t('loans.pageDescription')}
        </p>
      </div>
      <Link href="/loans/new">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('loans.newLoan')}
        </Button>
      </Link>
    </div>
  )
}