import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getLoanStatus } from "@/lib/loan-utils"
import { Package, PackageCheck, AlertCircle, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  userId: string
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const loans = await prisma.loan.findMany({
    where: { userId },
  })

  const stats = loans.reduce(
    (acc, loan) => {
      const status = getLoanStatus(loan)
      acc[status]++
      acc.total++
      return acc
    },
    { active: 0, overdue: 0, returned: 0, total: 0 }
  )

  const returnRate = stats.total > 0 
    ? Math.round((stats.returned / stats.total) * 100) 
    : 0

  const statCards = [
    {
      title: "Total Loans",
      value: stats.total,
      icon: Package,
      description: "All time loans",
      color: "text-blue-600",
    },
    {
      title: "Active Loans",
      value: stats.active,
      icon: TrendingUp,
      description: "Currently lent out",
      color: "text-green-600",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      description: "Need attention",
      color: "text-red-600",
    },
    {
      title: "Return Rate",
      value: `${returnRate}%`,
      icon: PackageCheck,
      description: "Successfully returned",
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