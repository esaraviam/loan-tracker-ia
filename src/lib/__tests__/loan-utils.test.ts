import { 
  getLoanStatus, 
  calculateOverdueDays, 
  formatCurrency, 
  getStatusBadge,
  calculateTotalLoans,
  getOverdueLoans,
  formatLoanDate
} from "@/lib/loan-utils"
import { Loan, LoanStatus } from "@prisma/client"

describe("Loan Utils", () => {
  const mockLoan: Loan = {
    id: "1",
    borrowerName: "John Doe",
    borrowerEmail: "john@example.com",
    borrowerPhone: "123456789",
    itemDescription: "MacBook Pro",
    amount: 2500,
    loanDate: new Date("2024-01-01"),
    dueDate: new Date("2024-02-01"),
    returnDate: null,
    notes: null,
    photos: [],
    status: LoanStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user1",
    categoryId: "cat1"
  }

  describe("getLoanStatus", () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("should return RETURNED for loans with return date", () => {
      const returnedLoan = {
        ...mockLoan,
        returnDate: new Date("2024-01-15"),
        status: LoanStatus.RETURNED
      }
      
      expect(getLoanStatus(returnedLoan)).toBe(LoanStatus.RETURNED)
    })

    it("should return OVERDUE for loans past due date", () => {
      const overdueLoan = {
        ...mockLoan,
        dueDate: new Date("2024-01-10"), // 5 days ago
        status: LoanStatus.OVERDUE
      }
      
      expect(getLoanStatus(overdueLoan)).toBe(LoanStatus.OVERDUE)
    })

    it("should return ACTIVE for current loans", () => {
      const activeLoan = {
        ...mockLoan,
        dueDate: new Date("2024-01-20"), // 5 days in future
        status: LoanStatus.ACTIVE
      }
      
      expect(getLoanStatus(activeLoan)).toBe(LoanStatus.ACTIVE)
    })
  })

  describe("calculateOverdueDays", () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("should return 0 for non-overdue loans", () => {
      const activeLoan = {
        ...mockLoan,
        dueDate: new Date("2024-01-20"), // 5 days in future
      }
      
      expect(calculateOverdueDays(activeLoan.dueDate)).toBe(0)
    })

    it("should calculate correct overdue days", () => {
      const overdueLoan = {
        ...mockLoan,
        dueDate: new Date("2024-01-10"), // 5 days ago
      }
      
      expect(calculateOverdueDays(overdueLoan.dueDate)).toBe(5)
    })

    it("should return 0 for today's due date", () => {
      const todayLoan = {
        ...mockLoan,
        dueDate: new Date("2024-01-15"),
      }
      
      expect(calculateOverdueDays(todayLoan.dueDate)).toBe(0)
    })
  })

  describe("formatCurrency", () => {
    it("should format positive amounts", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56")
    })

    it("should format zero", () => {
      expect(formatCurrency(0)).toBe("$0.00")
    })

    it("should format negative amounts", () => {
      expect(formatCurrency(-500)).toBe("-$500.00")
    })

    it("should handle large numbers", () => {
      expect(formatCurrency(1000000.99)).toBe("$1,000,000.99")
    })

    it("should round to 2 decimal places", () => {
      expect(formatCurrency(123.456)).toBe("$123.46")
    })
  })

  describe("getStatusBadge", () => {
    it("should return correct badge for ACTIVE", () => {
      const badge = getStatusBadge(LoanStatus.ACTIVE)
      expect(badge.text).toBe("Active")
      expect(badge.variant).toBe("default")
    })

    it("should return correct badge for OVERDUE", () => {
      const badge = getStatusBadge(LoanStatus.OVERDUE)
      expect(badge.text).toBe("Overdue")
      expect(badge.variant).toBe("destructive")
    })

    it("should return correct badge for RETURNED", () => {
      const badge = getStatusBadge(LoanStatus.RETURNED)
      expect(badge.text).toBe("Returned")
      expect(badge.variant).toBe("secondary")
    })
  })

  describe("calculateTotalLoans", () => {
    it("should calculate total from array of loans", () => {
      const loans = [
        { ...mockLoan, amount: 100 },
        { ...mockLoan, amount: 200 },
        { ...mockLoan, amount: 300 }
      ]
      
      expect(calculateTotalLoans(loans)).toBe(600)
    })

    it("should return 0 for empty array", () => {
      expect(calculateTotalLoans([])).toBe(0)
    })

    it("should handle decimal amounts", () => {
      const loans = [
        { ...mockLoan, amount: 10.50 },
        { ...mockLoan, amount: 20.25 }
      ]
      
      expect(calculateTotalLoans(loans)).toBe(30.75)
    })
  })

  describe("getOverdueLoans", () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("should filter overdue loans", () => {
      const loans = [
        { ...mockLoan, dueDate: new Date("2024-01-10"), status: LoanStatus.OVERDUE },
        { ...mockLoan, dueDate: new Date("2024-01-20"), status: LoanStatus.ACTIVE },
        { ...mockLoan, dueDate: new Date("2024-01-05"), status: LoanStatus.OVERDUE }
      ]
      
      const overdueLoans = getOverdueLoans(loans)
      expect(overdueLoans).toHaveLength(2)
    })

    it("should not include returned loans", () => {
      const loans = [
        { ...mockLoan, dueDate: new Date("2024-01-10"), status: LoanStatus.OVERDUE },
        { ...mockLoan, dueDate: new Date("2024-01-05"), status: LoanStatus.RETURNED, returnDate: new Date() }
      ]
      
      const overdueLoans = getOverdueLoans(loans)
      expect(overdueLoans).toHaveLength(1)
    })
  })

  describe("formatLoanDate", () => {
    it("should format date correctly", () => {
      const date = new Date("2024-01-15")
      expect(formatLoanDate(date)).toBe("Jan 15, 2024")
    })

    it("should handle invalid dates", () => {
      expect(formatLoanDate(null)).toBe("N/A")
      expect(formatLoanDate(undefined)).toBe("N/A")
    })
  })
})