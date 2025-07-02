import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { getLoanStatus } from "@/lib/loan-utils"
import { format, subDays, startOfYear, endOfYear } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const exportFormat = searchParams.get("format") || "csv"
    const dateRange = searchParams.get("dateRange") || "all"
    const includePhotos = searchParams.get("includePhotos") === "true"
    const includeReturned = searchParams.get("includeReturned") === "true"

    // Build date filter
    let dateFilter = {}
    const now = new Date()
    
    switch (dateRange) {
      case "30days":
        dateFilter = { gte: subDays(now, 30) }
        break
      case "90days":
        dateFilter = { gte: subDays(now, 90) }
        break
      case "year":
        dateFilter = {
          gte: startOfYear(now),
          lte: endOfYear(now),
        }
        break
      case "lastyear":
        const lastYear = new Date(now.getFullYear() - 1, 0, 1)
        dateFilter = {
          gte: startOfYear(lastYear),
          lte: endOfYear(lastYear),
        }
        break
    }

    // Build where clause
    const where: any = { userId: user.id }
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter
    }
    if (!includeReturned) {
      where.returnedAt = null
    }

    // Fetch loans with photos
    const loans = await prisma.loan.findMany({
      where,
      include: {
        photos: includePhotos,
      },
      orderBy: { createdAt: "desc" },
    })

    // Format data based on export format
    if (exportFormat === "csv") {
      const csv = generateCSV(loans, includePhotos)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="loans-export-${format(now, "yyyy-MM-dd")}.csv"`,
        },
      })
    } else if (exportFormat === "json") {
      const json = JSON.stringify(loans, null, 2)
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="loans-export-${format(now, "yyyy-MM-dd")}.json"`,
        },
      })
    } else if (exportFormat === "pdf") {
      // For PDF, we'll return a simple HTML that can be printed
      const html = generatePDFHTML(loans, user.email)
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="loans-export-${format(now, "yyyy-MM-dd")}.html"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}

function generateCSV(loans: any[], includePhotos: boolean): string {
  const headers = [
    "ID",
    "Item Name",
    "Recipient",
    "Description",
    "Quantity",
    "Status",
    "Borrowed Date",
    "Return By",
    "Returned Date",
    "Initial Condition",
    "Return Condition",
  ]

  if (includePhotos) {
    headers.push("Initial Photos", "Return Photos")
  }

  const rows = loans.map(loan => {
    const status = getLoanStatus(loan)
    const row = [
      loan.id,
      `"${loan.itemName}"`,
      `"${loan.recipientName}"`,
      `"${loan.description || ""}"`,
      loan.quantity,
      status,
      format(new Date(loan.borrowedAt), "yyyy-MM-dd"),
      format(new Date(loan.returnBy), "yyyy-MM-dd"),
      loan.returnedAt ? format(new Date(loan.returnedAt), "yyyy-MM-dd") : "",
      `"${loan.stateStart}"`,
      `"${loan.stateEnd || ""}"`,
    ]

    if (includePhotos && loan.photos) {
      const initialPhotos = loan.photos
        .filter((p: any) => p.type === "initial")
        .map((p: any) => p.url)
        .join("; ")
      const returnPhotos = loan.photos
        .filter((p: any) => p.type === "return")
        .map((p: any) => p.url)
        .join("; ")
      
      row.push(`"${initialPhotos}"`, `"${returnPhotos}"`)
    }

    return row.join(",")
  })

  return [headers.join(","), ...rows].join("\n")
}

function generatePDFHTML(loans: any[], userEmail: string): string {
  const loanRows = loans.map(loan => {
    const status = getLoanStatus(loan)
    return `
      <tr>
        <td>${loan.itemName}</td>
        <td>${loan.recipientName}</td>
        <td>${loan.quantity}</td>
        <td>${status}</td>
        <td>${format(new Date(loan.borrowedAt), "MMM d, yyyy")}</td>
        <td>${format(new Date(loan.returnBy), "MMM d, yyyy")}</td>
        <td>${loan.returnedAt ? format(new Date(loan.returnedAt), "MMM d, yyyy") : "-"}</td>
      </tr>
    `
  }).join("")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Loan Export - ${format(new Date(), "MMMM d, yyyy")}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { margin-bottom: 30px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Loan Export Report</h1>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>Generated:</strong> ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
          <p><strong>Total Loans:</strong> ${loans.length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Recipient</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Borrowed</th>
              <th>Due</th>
              <th>Returned</th>
            </tr>
          </thead>
          <tbody>
            ${loanRows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by Loan Tracker</p>
        </div>
      </body>
    </html>
  `
}