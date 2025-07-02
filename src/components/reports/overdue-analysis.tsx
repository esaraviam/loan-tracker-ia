import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { prisma } from "@/lib/prisma"
import { getLoanStatus, calculateDaysOverdue } from "@/lib/loan-utils"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"

interface OverdueAnalysisProps {
  userId: string
}

export async function OverdueAnalysis({ userId }: OverdueAnalysisProps) {
  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: { returnBy: "asc" },
  })

  const overdueLoans = loans.filter(loan => getLoanStatus(loan) === "overdue")
  const totalOverdue = overdueLoans.length
  const totalActive = loans.filter(loan => getLoanStatus(loan) === "active").length
  const overduePercentage = totalActive + totalOverdue > 0
    ? Math.round((totalOverdue / (totalActive + totalOverdue)) * 100)
    : 0

  // Group overdue loans by severity
  const overdueSeverity = {
    mild: overdueLoans.filter(l => calculateDaysOverdue(l) <= 7).length,
    moderate: overdueLoans.filter(l => {
      const days = calculateDaysOverdue(l)
      return days > 7 && days <= 30
    }).length,
    severe: overdueLoans.filter(l => calculateDaysOverdue(l) > 30).length,
  }

  // Most overdue items
  const mostOverdueLoans = overdueLoans
    .sort((a, b) => calculateDaysOverdue(b) - calculateDaysOverdue(a))
    .slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Analysis</CardTitle>
        <CardDescription>Understanding your overdue patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overdue Rate</span>
            <span className="text-sm text-muted-foreground">{overduePercentage}%</span>
          </div>
          <Progress value={overduePercentage} className="h-2" />
        </div>

        {totalOverdue > 0 && (
          <>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Severity Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mild (≤7 days)</span>
                  <span className="text-sm font-medium">{overdueSeverity.mild}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Moderate (8-30 days)</span>
                  <span className="text-sm font-medium">{overdueSeverity.moderate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Severe (&gt;30 days)</span>
                  <span className="text-sm font-medium">{overdueSeverity.severe}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Most Overdue Items</h4>
              <div className="space-y-2">
                {mostOverdueLoans.map((loan) => (
                  <Alert key={loan.id} className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <span className="font-medium">{loan.itemName}</span>
                      <span className="text-muted-foreground"> to {loan.recipientName}</span>
                      <span className="text-destructive font-medium">
                        {" • "}{calculateDaysOverdue(loan)} days overdue
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </>
        )}

        {totalOverdue === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Great job!</p>
            <p className="text-sm text-muted-foreground">
              You have no overdue loans
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}