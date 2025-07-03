import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LoanDetail } from "@/components/loans/loan-detail"
import { ReturnLoanDialog } from "@/components/loans/return-loan-dialog"
import { getLoanStatus } from "@/lib/loan-utils"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LoanDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const loan = await prisma.loan.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      photos: true,
    },
  })

  if (!loan) {
    notFound()
  }

  const status = getLoanStatus(loan)

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/loans">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Loans
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{loan.itemName}</h1>
        </div>
        {status === "active" || status === "overdue" ? (
          <ReturnLoanDialog loanId={loan.id} />
        ) : null}
      </div>

      <LoanDetail loan={loan} />
    </div>
  )
}