import { prisma } from "@/lib/prisma"
import { getLoanStatus } from "@/lib/loan-utils"
import { DashboardStatsWrapper } from "./dashboard-stats-wrapper"

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

  return <DashboardStatsWrapper stats={stats} returnRate={returnRate} />
}