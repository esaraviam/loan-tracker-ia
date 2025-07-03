'use client'

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function NewLoanHeader() {
  const { t } = useTranslation()

  return (
    <div className="mb-8">
      <Link href="/loans">
        <Button variant="ghost" size="sm" className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          {t('loans.backToLoans')}
        </Button>
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">{t('loans.create.title')}</h1>
      <p className="text-muted-foreground mt-2">
        {t('loans.create.description')}
      </p>
    </div>
  )
}