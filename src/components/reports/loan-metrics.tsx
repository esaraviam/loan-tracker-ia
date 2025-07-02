import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getLoanStatus, calculateLoanDuration } from "@/lib/loan-utils"
import { TrendingUp, Clock, AlertTriangle, Users } from "lucide-react"

interface LoanMetricsProps {
  userId: string
}

export async function LoanMetrics({ userId }: LoanMetricsProps) {
  const loans = await prisma.loan.findMany({
    where: { userId },
  })

  // Calculate metrics
  const totalLoans = loans.length
  const uniqueBorrowers = new Set(loans.map(l => l.recipientName)).size
  
  const avgDuration = loans.length > 0
    ? Math.round(
        loans.reduce((sum, loan) => sum + calculateLoanDuration(loan), 0) / loans.length
      )
    : 0

  const overdueCount = loans.filter(loan => getLoanStatus(loan) === "overdue").length
  const overdueRate = totalLoans > 0 
    ? Math.round((overdueCount / totalLoans) * 100)
    : 0

  const returnedOnTime = loans.filter(loan => {
    if (!loan.returnedAt) return false
    return new Date(loan.returnedAt) <= new Date(loan.returnBy)
  }).length

  const onTimeRate = totalLoans > 0
    ? Math.round((returnedOnTime / loans.filter(l => l.returnedAt).length) * 100)
    : 0

  const metrics = [
    {
      title: "Total Loans",
      value: totalLoans,
      icon: TrendingUp,
      description: "All time",
      color: "text-blue-600",
    },
    {
      title: "Unique Borrowers",
      value: uniqueBorrowers,
      icon: Users,
      description: "Different people",
      color: "text-green-600",
    },
    {
      title: "Avg. Loan Duration",
      value: `${avgDuration} days`,
      icon: Clock,
      description: "Average time",
      color: "text-purple-600",
    },
    {
      title: "On-Time Return Rate",
      value: `${onTimeRate}%`,
      icon: TrendingUp,
      description: "Returned on schedule",
      color: "text-emerald-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}