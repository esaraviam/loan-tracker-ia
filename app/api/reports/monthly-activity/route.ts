import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: "Invalid user" }, { status: 403 })
    }

    // Get data for the last 12 months
    const monthsData = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))

      const [loansCreated, loansReturned] = await Promise.all([
        prisma.loan.count({
          where: {
            userId,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prisma.loan.count({
          where: {
            userId,
            returnedAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ])

      monthsData.push({
        month: format(monthStart, "yyyy-MM-dd"),
        loans: loansCreated,
        returns: loansReturned,
      })
    }

    return NextResponse.json({ data: monthsData })
  } catch (error) {
    console.error("Error fetching monthly activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}