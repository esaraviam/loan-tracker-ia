import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { subDays, format, startOfDay, endOfDay } from "date-fns"

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

    // Get loans from the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30)
    
    const loans = await prisma.loan.findMany({
      where: {
        userId,
        borrowedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        borrowedAt: true,
        returnedAt: true,
      },
      orderBy: {
        borrowedAt: "asc",
      },
    })

    // Create timeline data for the last 30 days
    const timeline = []
    let activeCount = 0
    let returnedCount = 0

    // Count existing loans before the timeline period
    const existingLoans = await prisma.loan.findMany({
      where: {
        userId,
        borrowedAt: {
          lt: thirtyDaysAgo,
        },
      },
      select: {
        returnedAt: true,
      },
    })

    existingLoans.forEach(loan => {
      if (loan.returnedAt && loan.returnedAt < thirtyDaysAgo) {
        returnedCount++
      } else {
        activeCount++
      }
    })

    // Generate data points for each day
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      // Count loans borrowed on this day
      loans.forEach(loan => {
        if (loan.borrowedAt >= dayStart && loan.borrowedAt <= dayEnd) {
          activeCount++
        }
        if (loan.returnedAt && loan.returnedAt >= dayStart && loan.returnedAt <= dayEnd) {
          activeCount--
          returnedCount++
        }
      })

      timeline.push({
        date: format(date, "yyyy-MM-dd"),
        active: activeCount,
        returned: returnedCount,
      })
    }

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error("Error fetching loan timeline:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}