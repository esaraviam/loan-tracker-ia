import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { User } from "lucide-react"

interface TopBorrowersProps {
  userId: string
}

export async function TopBorrowers({ userId }: TopBorrowersProps) {
  const loans = await prisma.loan.findMany({
    where: { userId },
    select: {
      recipientName: true,
      returnedAt: true,
    },
  })

  // Group by recipient and calculate stats
  const borrowerStats = loans.reduce((acc, loan) => {
    const name = loan.recipientName
    if (!acc[name]) {
      acc[name] = { total: 0, returned: 0 }
    }
    acc[name].total++
    if (loan.returnedAt) {
      acc[name].returned++
    }
    return acc
  }, {} as Record<string, { total: number; returned: number }>)

  // Convert to array and sort by total loans
  const topBorrowers = Object.entries(borrowerStats)
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      returned: stats.returned,
      returnRate: Math.round((stats.returned / stats.total) * 100),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  if (topBorrowers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Borrowers</CardTitle>
          <CardDescription>Most frequent borrowers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No borrower data available yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Borrowers</CardTitle>
        <CardDescription>Most frequent borrowers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topBorrowers.map((borrower, index) => (
            <div key={borrower.name} className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Avatar>
                  <AvatarFallback>
                    {borrower.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{borrower.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {borrower.total} loans • {borrower.returned} returned
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={borrower.returnRate >= 80 ? "default" : "secondary"}>
                  {borrower.returnRate}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}