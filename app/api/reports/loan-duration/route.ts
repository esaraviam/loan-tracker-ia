import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { calculateLoanDuration } from "@/lib/loan-utils"

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

    const loans = await prisma.loan.findMany({
      where: { userId },
      select: {
        borrowedAt: true,
        returnedAt: true,
        returnBy: true,
      },
    })

    // Categorize loans by duration
    const durations = {
      "< 7 days": 0,
      "7-30 days": 0,
      "1-3 months": 0,
      "> 3 months": 0,
    }

    loans.forEach(loan => {
      const duration = calculateLoanDuration(loan)
      
      if (duration < 7) {
        durations["< 7 days"]++
      } else if (duration <= 30) {
        durations["7-30 days"]++
      } else if (duration <= 90) {
        durations["1-3 months"]++
      } else {
        durations["> 3 months"]++
      }
    })

    return NextResponse.json({ durations })
  } catch (error) {
    console.error("Error fetching loan duration data:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}