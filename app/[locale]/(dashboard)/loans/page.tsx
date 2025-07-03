import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { LoanFilters } from "@/components/loans/loan-filters"
import { LoanList } from "@/components/loans/loan-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{
    filter?: string
    search?: string
    sort?: string
  }>
}

export default async function LoansPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) return null

  const params = await searchParams

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Loans</h1>
          <p className="text-muted-foreground">
            Manage and track all your personal loans
          </p>
        </div>
        <Link href="/loans/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Loan
          </Button>
        </Link>
      </div>

      <LoanFilters />

      <Suspense fallback={<LoanListSkeleton />}>
        <LoanList 
          userId={user.id} 
          filter={params.filter}
          search={params.search}
          sort={params.sort}
        />
      </Suspense>
    </div>
  )
}

function LoanListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  )
}