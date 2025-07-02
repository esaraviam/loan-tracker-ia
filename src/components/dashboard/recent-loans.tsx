import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { getLoanStatus, getStatusColor } from "@/lib/loan-utils"
import { ArrowRight, Calendar, Package, User } from "lucide-react"

interface RecentLoansProps {
  userId: string
}

export async function RecentLoans({ userId }: RecentLoansProps) {
  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      photos: {
        where: { type: "initial" },
        take: 1,
      },
    },
  })

  if (loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Loans</CardTitle>
          <CardDescription>Your latest lending activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No loans yet</p>
            <Link href="/loans/new">
              <Button>Create Your First Loan</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Loans</CardTitle>
          <CardDescription>Your latest lending activity</CardDescription>
        </div>
        <Link href="/loans">
          <Button variant="ghost" size="sm" className="gap-2">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loans.map((loan) => {
            const status = getLoanStatus(loan)
            const statusColor = getStatusColor(status)
            
            return (
              <Link
                key={loan.id}
                href={`/loans/${loan.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{loan.itemName}</p>
                      <Badge
                        variant={status === "overdue" ? "destructive" : "secondary"}
                        className={statusColor}
                      >
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {loan.recipientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(loan.borrowedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {loan.quantity > 1 && (
                      <Badge variant="outline">×{loan.quantity}</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}