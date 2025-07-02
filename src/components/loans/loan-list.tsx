import { prisma } from "@/lib/prisma"
import { LoanCard } from "./loan-card"
import { Package } from "lucide-react"
import { getLoanStatus } from "@/lib/loan-utils"
import type { Prisma } from "@prisma/client"

interface LoanListProps {
  userId: string
  filter?: string
  search?: string
  sort?: string
}

export async function LoanList({ userId, filter, search, sort }: LoanListProps) {
  // Build where clause based on filters
  const where: Prisma.LoanWhereInput = {
    userId,
  }

  // Apply status filter
  if (filter && filter !== "all") {
    switch (filter) {
      case "active":
        where.returnedAt = null
        where.returnBy = { gt: new Date() }
        break
      case "overdue":
        where.returnedAt = null
        where.returnBy = { lt: new Date() }
        break
      case "returned":
        where.returnedAt = { not: null }
        break
    }
  }

  // Apply search filter
  if (search) {
    where.OR = [
      { itemName: { contains: search } },
      { recipientName: { contains: search } },
      { description: { contains: search } },
    ]
  }

  // Determine sort order
  const orderBy: Prisma.LoanOrderByWithRelationInput = {}
  switch (sort) {
    case "oldest":
      orderBy.createdAt = "asc"
      break
    case "return-date":
      orderBy.returnBy = "asc"
      break
    case "name":
      orderBy.itemName = "asc"
      break
    default: // newest
      orderBy.createdAt = "desc"
  }

  const loans = await prisma.loan.findMany({
    where,
    orderBy,
    include: {
      photos: {
        where: { type: "initial" },
        take: 1,
      },
    },
  })

  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No loans found</h3>
        <p className="text-muted-foreground max-w-sm">
          {search ? "Try adjusting your search terms" : "Create your first loan to get started"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>
  )
}