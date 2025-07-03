"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import type { ActionResult } from "./auth"

export async function getDashboardStatsAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    const now = new Date()

    // Get counts for different loan statuses
    const [totalLoans, activeLoans, overdueLoans, returnedLoans] = await Promise.all([
      prisma.loan.count({
        where: { userId: user.id },
      }),
      prisma.loan.count({
        where: {
          userId: user.id,
          returnedAt: null,
          returnBy: { gte: now },
        },
      }),
      prisma.loan.count({
        where: {
          userId: user.id,
          returnedAt: null,
          returnBy: { lt: now },
        },
      }),
      prisma.loan.count({
        where: {
          userId: user.id,
          returnedAt: { not: null },
        },
      }),
    ])

    // Get recent loans
    const recentLoans = await prisma.loan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        photos: {
          where: { type: "initial" },
          take: 1,
        },
      },
    })

    return {
      success: true,
      data: {
        stats: {
          total: totalLoans,
          active: activeLoans,
          overdue: overdueLoans,
          returned: returnedLoans,
        },
        recentLoans,
      }
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return {
      success: false,
      error: "Failed to fetch dashboard stats"
    }
  }
}

export async function getLoansByCategoryAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      select: {
        itemName: true,
        quantity: true,
      },
    })

    // Group by item name and sum quantities
    const categoryMap = new Map<string, number>()
    loans.forEach((loan) => {
      const current = categoryMap.get(loan.itemName) || 0
      categoryMap.set(loan.itemName, current + loan.quantity)
    })

    const categories = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 categories

    return {
      success: true,
      data: { categories }
    }
  } catch (error) {
    console.error("Get loans by category error:", error)
    return {
      success: false,
      error: "Failed to fetch loan categories"
    }
  }
}

export async function getLoanTimelineAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    // Get loans created in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const loans = await prisma.loan.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        returnedAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Group by date
    const timelineMap = new Map<string, { created: number; returned: number }>()
    
    loans.forEach((loan) => {
      const createdDate = loan.createdAt.toISOString().split("T")[0]
      const current = timelineMap.get(createdDate) || { created: 0, returned: 0 }
      current.created += 1
      timelineMap.set(createdDate, current)

      if (loan.returnedAt) {
        const returnedDate = loan.returnedAt.toISOString().split("T")[0]
        const returnCurrent = timelineMap.get(returnedDate) || { created: 0, returned: 0 }
        returnCurrent.returned += 1
        timelineMap.set(returnedDate, returnCurrent)
      }
    })

    const timeline = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        created: data.created,
        returned: data.returned,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      success: true,
      data: { timeline }
    }
  } catch (error) {
    console.error("Get loan timeline error:", error)
    return {
      success: false,
      error: "Failed to fetch loan timeline"
    }
  }
}

export async function getMonthlyActivityAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    // Get loans from the last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const loans = await prisma.loan.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        createdAt: true,
        returnedAt: true,
      },
    })

    // Group by month
    const monthlyMap = new Map<string, { created: number; returned: number }>()
    
    loans.forEach((loan) => {
      const month = loan.createdAt.toISOString().substring(0, 7) // YYYY-MM
      const current = monthlyMap.get(month) || { created: 0, returned: 0 }
      current.created += 1
      
      if (loan.returnedAt) {
        const returnMonth = loan.returnedAt.toISOString().substring(0, 7)
        const returnCurrent = monthlyMap.get(returnMonth) || { created: 0, returned: 0 }
        returnCurrent.returned += 1
        monthlyMap.set(returnMonth, returnCurrent)
      }
      
      monthlyMap.set(month, current)
    })

    const monthlyActivity = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        created: data.created,
        returned: data.returned,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return {
      success: true,
      data: { monthlyActivity }
    }
  } catch (error) {
    console.error("Get monthly activity error:", error)
    return {
      success: false,
      error: "Failed to fetch monthly activity"
    }
  }
}

export async function getLoanDurationStatsAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    const returnedLoans = await prisma.loan.findMany({
      where: {
        userId: user.id,
        returnedAt: { not: null },
      },
      select: {
        borrowedAt: true,
        returnedAt: true,
        itemName: true,
      },
    })

    const durations = returnedLoans.map((loan) => {
      const duration = loan.returnedAt!.getTime() - loan.borrowedAt.getTime()
      const days = Math.ceil(duration / (1000 * 60 * 60 * 24))
      return {
        itemName: loan.itemName,
        days,
      }
    })

    // Calculate average duration by item
    const itemDurationMap = new Map<string, { total: number; count: number }>()
    durations.forEach(({ itemName, days }) => {
      const current = itemDurationMap.get(itemName) || { total: 0, count: 0 }
      current.total += days
      current.count += 1
      itemDurationMap.set(itemName, current)
    })

    const averageDurations = Array.from(itemDurationMap.entries())
      .map(([itemName, { total, count }]) => ({
        itemName,
        averageDays: Math.round(total / count),
      }))
      .sort((a, b) => b.averageDays - a.averageDays)
      .slice(0, 10)

    return {
      success: true,
      data: { averageDurations }
    }
  } catch (error) {
    console.error("Get loan duration stats error:", error)
    return {
      success: false,
      error: "Failed to fetch loan duration stats"
    }
  }
}