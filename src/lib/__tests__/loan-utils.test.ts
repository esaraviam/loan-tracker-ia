import { 
  getLoanStatus, 
  calculateDaysOverdue, 
  calculateLoanDuration, 
  getStatusColor,
  formatCurrency
} from "@/lib/loan-utils"
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

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

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
        returnBy: new Date("2024-01-10"), // 5 days ago
      }
      
      expect(getLoanStatus(overdueLoan)).toBe("overdue")
    })

    it("should return 'active' for active loans", () => {
      const activeLoan = {
        ...mockLoan,
        returnBy: new Date("2024-01-20"), // 5 days in future
      }
      
      expect(getLoanStatus(activeLoan)).toBe("active")
    })

    it("should handle edge case - due today", () => {
      const dueTodayLoan = {
        ...mockLoan,
        returnBy: new Date("2024-01-15"),
      }
      
      expect(getLoanStatus(dueTodayLoan)).toBe("active")
    })
  })

  describe("calculateDaysOverdue", () => {
    it("should return 0 for non-overdue loans", () => {
      const activeLoan = {
        ...mockLoan,
        returnBy: new Date("2024-01-20"),
      }
      
      expect(calculateDaysOverdue(activeLoan)).toBe(0)
    })

    it("should return positive days for overdue loans", () => {
      const overdueLoan = {
        ...mockLoan,
        returnBy: new Date("2024-01-10"), // 5 days ago
      }
      
      expect(calculateDaysOverdue(overdueLoan)).toBe(5)
    })

    it("should return 0 for returned loans", () => {
      const returnedLoan = {
        ...mockLoan,
        returnedAt: new Date(),
        returnBy: new Date("2024-01-10"), // Was overdue
      }
      
      expect(calculateDaysOverdue(returnedLoan)).toBe(0)
    })

    it("should calculate correct days for multiple days overdue", () => {
      const overdueLoan = {
        ...mockLoan,
        returnBy: new Date("2024-01-01"), // 14 days ago
      }
      
      expect(calculateDaysOverdue(overdueLoan)).toBe(14)
    })
  })

  describe("calculateLoanDuration", () => {
    it("should calculate duration for active loans", () => {
      const loan = {
        ...mockLoan,
        borrowedAt: new Date("2024-01-05"), // 10 days ago
      }
      
      expect(calculateLoanDuration(loan)).toBe(10)
    })

    it("should calculate duration for returned loans", () => {
      const loan = {
        ...mockLoan,
        borrowedAt: new Date("2024-01-01"),
        returnedAt: new Date("2024-01-11"), // 10 days later
      }
      
      expect(calculateLoanDuration(loan)).toBe(10)
    })

    it("should handle same day loan and return", () => {
      const loan = {
        ...mockLoan,
        borrowedAt: new Date("2024-01-15"),
        returnedAt: new Date("2024-01-15"),
      }
      
      expect(calculateLoanDuration(loan)).toBe(0)
    })

    it("should calculate from loan date to current date for active loans", () => {
      const loan = {
        borrowedAt: new Date("2024-01-01"),
        returnedAt: null,
      }
      
      expect(calculateLoanDuration(loan)).toBe(14)
    })
  })

  describe("formatCurrency", () => {
    it("should format positive amounts correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56")
    })

    it("should format zero correctly", () => {
      expect(formatCurrency(0)).toBe("$0.00")
    })

    it("should format negative amounts correctly", () => {
      expect(formatCurrency(-100)).toBe("-$100.00")
    })

    it("should handle large numbers", () => {
      expect(formatCurrency(1000000)).toBe("$1,000,000.00")
    })

    it("should round to 2 decimal places", () => {
      expect(formatCurrency(123.456)).toBe("$123.46")
    })

    it("should handle very small amounts", () => {
      expect(formatCurrency(0.01)).toBe("$0.01")
    })
  })

  describe("getStatusColor", () => {
    it("should return green classes for active status", () => {
      const color = getStatusColor("active")
      expect(color).toContain("green")
      expect(color).toContain("text-green-600")
      expect(color).toContain("bg-green-50")
    })

    it("should return red classes for overdue status", () => {
      const color = getStatusColor("overdue")
      expect(color).toContain("red")
      expect(color).toContain("text-red-600")
      expect(color).toContain("bg-red-50")
    })

    it("should return gray classes for returned status", () => {
      const color = getStatusColor("returned")
      expect(color).toContain("gray")
      expect(color).toContain("text-gray-600")
      expect(color).toContain("bg-gray-50")
    })

    it("should include dark mode classes", () => {
      expect(getStatusColor("active")).toContain("dark:text-green-400")
      expect(getStatusColor("overdue")).toContain("dark:text-red-400")
      expect(getStatusColor("returned")).toContain("dark:text-gray-400")
    })
  })
})