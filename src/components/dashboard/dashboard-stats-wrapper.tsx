'use client'

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PackageCheck, AlertCircle, TrendingUp } from "lucide-react"

interface DashboardStatsWrapperProps {
  stats: {
    active: number
    overdue: number
    returned: number
    total: number
  }
  returnRate: number
}

export function DashboardStatsWrapper({ stats, returnRate }: DashboardStatsWrapperProps) {
  const { t } = useTranslation()

  const statCards = [
    {
      title: t('dashboard.stats.total'),
      value: stats.total,
      icon: Package,
      description: t('dashboard.stats.totalDesc'),
      color: "text-blue-600",
    },
    {
      title: t('dashboard.stats.active'),
      value: stats.active,
      icon: TrendingUp,
      description: t('dashboard.stats.activeDesc'),
      color: "text-green-600",
    },
    {
      title: t('dashboard.stats.overdue'),
      value: stats.overdue,
      icon: AlertCircle,
      description: t('dashboard.stats.overdueDesc'),
      color: "text-red-600",
    },
    {
      title: t('dashboard.stats.returnRate'),
      value: `${returnRate}%`,
      icon: PackageCheck,
      description: t('dashboard.stats.returnRateDesc'),
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}