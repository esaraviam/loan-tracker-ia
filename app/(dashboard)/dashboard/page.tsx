import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentLoans } from "@/components/dashboard/recent-loans"
import { LoansByCategory } from "@/components/dashboard/loans-by-category"
import { LoanTimeline } from "@/components/dashboard/loan-timeline"
import { OverdueAlert } from "@/components/dashboard/overdue-alert"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="container py-8 space-y-8">
      <DashboardHeader userEmail={user.email} />

      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <OverdueAlert userId={user.id} />
      </Suspense>

      <QuickActions />

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats userId={user.id} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <LoansByCategory userId={user.id} />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-96" />}>
          <LoanTimeline userId={user.id} />
        </Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <RecentLoans userId={user.id} />
      </Suspense>
    </div>
  )
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  )
}