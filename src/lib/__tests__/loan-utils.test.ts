import { getLoanStatus, calculateDaysOverdue, calculateLoanDuration, getStatusColor } from "@/lib/loan-utils"
import type { Loan } from "@prisma/client"

describe("Loan Utils", () => {
  const mockLoan: Loan = {
    id: "1",
    userId: "user1",
    recipientName: "John Doe",
    itemName: "Book",
    description: null,
    quantity: 1,
    borrowedAt: new Date("2024-01-01"),
    returnBy: new Date("2024-02-01"),
    returnedAt: null,
    stateStart: "Good",
    stateEnd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe("getLoanStatus", () => {
    it("should return 'returned' for returned loans", () => {
      const returnedLoan = {
        ...mockLoan,
        returnedAt: new Date("2024-01-15"),
      }
      
      expect(getLoanStatus(returnedLoan)).toBe("returned")
    })

    it("should return 'overdue' for overdue loans", () => {
      const overdueLoan = {
        ...mockLoan,
        returnBy: new Date("2020-01-01"), // Past date
      }
      
      expect(getLoanStatus(overdueLoan)).toBe("overdue")
    })

    it("should return 'active' for active loans", () => {
      const activeLoan = {
        ...mockLoan,
        returnBy: new Date("2030-01-01"), // Future date
      }
      
      expect(getLoanStatus(activeLoan)).toBe("active")
    })
  })

  describe("calculateDaysOverdue", () => {
    it("should return 0 for non-overdue loans", () => {
      const activeLoan = {
        ...mockLoan,
        returnBy: new Date("2030-01-01"),
      }
      
      expect(calculateDaysOverdue(activeLoan)).toBe(0)
    })

    it("should return positive days for overdue loans", () => {
      const overdueLoan = {
        ...mockLoan,
        returnBy: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      }
      
      expect(calculateDaysOverdue(overdueLoan)).toBeGreaterThan(0)
    })

    it("should return 0 for returned loans", () => {
      const returnedLoan = {
        ...mockLoan,
        returnedAt: new Date(),
      }
      
      expect(calculateDaysOverdue(returnedLoan)).toBe(0)
    })
  })

  describe("calculateLoanDuration", () => {
    it("should calculate duration for active loans", () => {
      const loan = {
        ...mockLoan,
        borrowedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      }
      
      expect(calculateLoanDuration(loan)).toBeGreaterThanOrEqual(10)
    })

    it("should calculate duration for returned loans", () => {
      const loan = {
        ...mockLoan,
        borrowedAt: new Date("2024-01-01"),
        returnedAt: new Date("2024-01-11"), // 10 days later
      }
      
      expect(calculateLoanDuration(loan)).toBe(11)
    })
  })

  describe("getStatusColor", () => {
    it("should return green classes for active status", () => {
      const color = getStatusColor("active")
      expect(color).toContain("green")
    })

    it("should return red classes for overdue status", () => {
      const color = getStatusColor("overdue")
      expect(color).toContain("red")
    })

    it("should return gray classes for returned status", () => {
      const color = getStatusColor("returned")
      expect(color).toContain("gray")
    })
  })
})