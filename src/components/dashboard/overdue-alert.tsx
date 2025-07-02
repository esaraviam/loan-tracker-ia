import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { prisma } from "@/lib/prisma"
import { getLoanStatus, calculateDaysOverdue } from "@/lib/loan-utils"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

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
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Attention Required</AlertTitle>
      <AlertDescription>
        You have {overdueLoans.length} overdue loan{overdueLoans.length > 1 ? 's' : ''}.
        {' '}<strong>{mostOverdue.itemName}</strong> is {calculateDaysOverdue(mostOverdue)} days overdue.
        {' '}
        <Link href="/loans?filter=overdue" className="underline font-medium">
          View all overdue loans
        </Link>
      </AlertDescription>
    </Alert>
  )
}