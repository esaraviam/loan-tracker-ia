import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExportOptions } from "@/components/loans/export-options"

export default function ExportLoansPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <Link href="/loans">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Loans
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Export Loan Data</h1>
        <p className="text-muted-foreground mt-2">
          Download your loan records in various formats
        </p>
      </div>

      <ExportOptions />
    </div>
  )
}