'use client'

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { formatDateShort } from "@/lib/date-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Package, User } from "lucide-react"
import { getStatusColor } from "@/lib/loan-utils"

interface Loan {
  id: string
  itemName: string
  recipientName: string
  quantity: number
  borrowedAt: Date | string
  returnBy: Date | string
  returnedAt: Date | string | null
  photos: { id: string; url: string; type: string }[]
}

interface RecentLoansWrapperProps {
  loans: Loan[]
}

export function RecentLoansWrapper({ loans }: RecentLoansWrapperProps) {
  const { t } = useTranslation()

  const getLoanStatus = (loan: Loan) => {
    if (loan.returnedAt) return "returned"
    const now = new Date()
    const returnBy = new Date(loan.returnBy)
    return returnBy < now ? "overdue" : "active"
  }

  if (loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentLoans.title')}</CardTitle>
          <CardDescription>{t('dashboard.recentLoans.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('dashboard.recentLoans.empty')}</p>
            <Link href="/loans/new">
              <Button>{t('dashboard.recentLoans.createFirst')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('dashboard.recentLoans.title')}</CardTitle>
          <CardDescription>{t('dashboard.recentLoans.description')}</CardDescription>
        </div>
        <Link href="/loans">
          <Button variant="ghost" size="sm" className="gap-2">
            {t('dashboard.recentLoans.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loans.map((loan) => {
            const status = getLoanStatus(loan)
            const statusColor = getStatusColor(status)
            
            return (
              <Link
                key={loan.id}
                href={`/loans/${loan.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{loan.itemName}</p>
                      <Badge
                        variant={status === "overdue" ? "destructive" : "secondary"}
                        className={statusColor}
                      >
                        {t(`loans.status.${status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {loan.recipientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateShort(loan.borrowedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loan.quantity > 1 && (
                      <Badge variant="outline">×{loan.quantity}</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}