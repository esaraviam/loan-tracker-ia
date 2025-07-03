import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoanForm } from "@/components/loans/loan-form"
import { NewLoanHeader } from "@/components/loans/new-loan-header"

export default function NewLoanPage() {
  return (
    <div className="container max-w-3xl py-8">
      <NewLoanHeader />
      <LoanForm />
    </div>
  )
}