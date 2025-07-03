import { prisma } from "@/lib/prisma"
import { getLoanStatus, calculateDaysOverdue } from "@/lib/loan-utils"
import { OverdueAlertWrapper } from "./overdue-alert-wrapper"

interface OverdueAlertProps {
  userId: string
}

export async function OverdueAlert({ userId }: OverdueAlertProps) {
  const loans = await prisma.loan.findMany({
    where: { 
      userId,
      returnedAt: null,
    },
  })

  const overdueLoans = loans.filter(loan => getLoanStatus(loan) === "overdue")

  if (overdueLoans.length === 0) {
    return null
  }

  const mostOverdue = overdueLoans.reduce((prev, current) => 
    calculateDaysOverdue(current) > calculateDaysOverdue(prev) ? current : prev
  )

  return (
    <OverdueAlertWrapper
      overdueCount={overdueLoans.length}
      mostOverdueItem={mostOverdue.itemName}
      daysOverdue={calculateDaysOverdue(mostOverdue)}
    />
  )
}