import { Loan } from "@prisma/client"

export type LoanStatus = "active" | "overdue" | "returned"

export function getLoanStatus(loan: Loan): LoanStatus {
  if (loan.returnedAt) {
    return "returned"
  }
  
  if (new Date(loan.returnBy) < new Date()) {
    return "overdue"
  }
  
  return "active"
}

export function calculateDaysOverdue(loan: Loan): number {
  if (loan.returnedAt || getLoanStatus(loan) !== "overdue") {
    return 0
  }
  
  const today = new Date()
  const returnBy = new Date(loan.returnBy)
  const diffTime = today.getTime() - returnBy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

export function calculateLoanDuration(loan: Pick<Loan, "borrowedAt" | "returnedAt">): number {
  const startDate = new Date(loan.borrowedAt)
  const endDate = loan.returnedAt ? new Date(loan.returnedAt) : new Date()
  const diffTime = endDate.getTime() - startDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function getStatusColor(status: LoanStatus): string {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950"
    case "overdue":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950"
    case "returned":
      return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"
    default:
      return ""
  }
}