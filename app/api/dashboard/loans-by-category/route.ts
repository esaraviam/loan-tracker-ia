import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

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
        itemName: true,
        quantity: true,
      },
    })

    // Group loans by category (we'll use the first word of item name as category)
    const categories = loans.reduce((acc, loan) => {
      // Extract category from item name (e.g., "Book" from "Book - JavaScript Guide")
      const category = loan.itemName.split(/[-\s]/)[0]?.trim() || "Other"
      
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += loan.quantity
      
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching loan categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}