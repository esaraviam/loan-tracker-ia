import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LoanMetrics } from "@/components/reports/loan-metrics"
import { MonthlyActivity } from "@/components/reports/monthly-activity"
import { TopBorrowers } from "@/components/reports/top-borrowers"
import { LoanDurationChart } from "@/components/reports/loan-duration-chart"
import { OverdueAnalysis } from "@/components/reports/overdue-analysis"

export default async function ReportsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Detailed insights into your lending patterns and statistics
        </p>
      </div>

      <div className="grid gap-6">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <LoanMetrics userId={user.id} />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <MonthlyActivity userId={user.id} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-96" />}>
            <LoanDurationChart userId={user.id} />
          </Suspense>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <TopBorrowers userId={user.id} />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-96" />}>
            <OverdueAnalysis userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}