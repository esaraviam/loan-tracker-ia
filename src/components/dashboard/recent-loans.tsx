import { prisma } from "@/lib/prisma"
import { RecentLoansWrapper } from "./recent-loans-wrapper"

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

  return <RecentLoansWrapper loans={loans} />
}