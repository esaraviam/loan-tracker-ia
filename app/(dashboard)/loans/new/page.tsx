import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoanForm } from "@/components/loans/loan-form"

export default function NewLoanPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <Link href="/loans">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Loans
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Loan</h1>
        <p className="text-muted-foreground mt-2">
          Record details about the item you&apos;re lending out
        </p>
      </div>

      <LoanForm />
    </div>
  )
}