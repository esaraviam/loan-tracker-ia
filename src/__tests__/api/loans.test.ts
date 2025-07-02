import { NextRequest } from 'next/server'
import { GET as getLoansHandler, POST as createLoanHandler } from '@/app/api/loans/route'
import { POST as returnLoanHandler } from '@/app/api/loans/[id]/return/route'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { LoanStatus } from '@prisma/client'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    loan: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}))

describe('Loan API Routes', () => {
  const mockUserId = 'user123'
  const mockToken = { userId: mockUserId, email: 'test@example.com' }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(verifyToken as jest.Mock).mockReturnValue(mockToken)
  })

  describe('GET /api/loans', () => {
    it('should return user loans with pagination', async () => {
      const mockLoans = [
        {
          id: 'loan1',
          borrowerName: 'John Doe',
          itemDescription: 'Book',
          amount: 100,
          status: LoanStatus.ACTIVE,
          loanDate: new Date(),
          dueDate: new Date(),
        },
        {
          id: 'loan2',
          borrowerName: 'Jane Smith',
          itemDescription: 'Laptop',
          amount: 1000,
          status: LoanStatus.OVERDUE,
          loanDate: new Date(),
          dueDate: new Date(),
        },
      ]

      ;(prisma.loan.findMany as jest.Mock).mockResolvedValue(mockLoans)
      ;(prisma.loan.count as jest.Mock).mockResolvedValue(2)

      const request = new NextRequest('http://localhost/api/loans?page=1&limit=10', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      })

      const response = await getLoansHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.loans).toEqual(mockLoans)
      expect(data.total).toBe(2)
      expect(data.page).toBe(1)
      expect(data.totalPages).toBe(1)
      
      expect(prisma.loan.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should filter loans by status', async () => {
      const activeLoan = {
        id: 'loan1',
        status: LoanStatus.ACTIVE,
      }

      ;(prisma.loan.findMany as jest.Mock).mockResolvedValue([activeLoan])
      ;(prisma.loan.count as jest.Mock).mockResolvedValue(1)

      const request = new NextRequest('http://localhost/api/loans?status=ACTIVE', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      })

      await getLoansHandler(request)

      expect(prisma.loan.findMany).toHaveBeenCalledWith({
        where: { 
          userId: mockUserId,
          status: LoanStatus.ACTIVE,
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should search loans by query', async () => {
      const request = new NextRequest('http://localhost/api/loans?search=laptop', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      })

      await getLoansHandler(request)

      expect(prisma.loan.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          OR: [
            { borrowerName: { contains: 'laptop', mode: 'insensitive' } },
            { itemDescription: { contains: 'laptop', mode: 'insensitive' } },
            { borrowerEmail: { contains: 'laptop', mode: 'insensitive' } },
          ],
        },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should return 401 when not authenticated', async () => {
      ;(verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = new NextRequest('http://localhost/api/loans')

      const response = await getLoansHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST /api/loans', () => {
    it('should create a new loan successfully', async () => {
      const newLoanData = {
        borrowerName: 'John Doe',
        borrowerEmail: 'john@example.com',
        borrowerPhone: '1234567890',
        itemDescription: 'JavaScript Book',
        amount: 50,
        loanDate: new Date('2024-01-01'),
        dueDate: new Date('2024-02-01'),
        categoryId: 'cat123',
        notes: 'First edition',
      }

      const mockCreatedLoan = {
        id: 'loan123',
        ...newLoanData,
        userId: mockUserId,
        status: LoanStatus.ACTIVE,
        returnDate: null,
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 'cat123' })
      ;(prisma.loan.create as jest.Mock).mockResolvedValue(mockCreatedLoan)

      const request = new NextRequest('http://localhost/api/loans', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify(newLoanData),
      })

      const response = await createLoanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedLoan)
      expect(prisma.loan.create).toHaveBeenCalledWith({
        data: {
          ...newLoanData,
          userId: mockUserId,
          status: LoanStatus.ACTIVE,
        },
        include: { category: true },
      })
    })

    it('should validate loan data', async () => {
      const invalidData = {
        borrowerName: '',
        amount: -100,
        loanDate: new Date('2024-02-01'),
        dueDate: new Date('2024-01-01'), // Due date before loan date
      }

      const request = new NextRequest('http://localhost/api/loans', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify(invalidData),
      })

      const response = await createLoanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('validation')
    })

    it('should handle invalid category', async () => {
      ;(prisma.category.findFirst as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/loans', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({
          borrowerName: 'John Doe',
          borrowerEmail: 'john@example.com',
          borrowerPhone: '1234567890',
          itemDescription: 'Book',
          amount: 50,
          loanDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          categoryId: 'invalid-cat',
        }),
      })

      const response = await createLoanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid category')
    })
  })

  describe('POST /api/loans/[id]/return', () => {
    it('should mark loan as returned successfully', async () => {
      const loanId = 'loan123'
      const mockLoan = {
        id: loanId,
        userId: mockUserId,
        status: LoanStatus.ACTIVE,
        returnDate: null,
      }

      const returnDate = new Date('2024-01-15')
      const condition = 'Good condition'

      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan)
      ;(prisma.loan.update as jest.Mock).mockResolvedValue({
        ...mockLoan,
        status: LoanStatus.RETURNED,
        returnDate,
        notes: `${mockLoan.notes || ''}\nReturn condition: ${condition}`,
      })

      const request = new NextRequest(`http://localhost/api/loans/${loanId}/return`, {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ returnDate, condition }),
      })

      const response = await returnLoanHandler(request, { params: { id: loanId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe(LoanStatus.RETURNED)
      expect(data.returnDate).toBe(returnDate.toISOString())
      
      expect(prisma.loan.update).toHaveBeenCalledWith({
        where: { id: loanId },
        data: {
          status: LoanStatus.RETURNED,
          returnDate,
          notes: expect.stringContaining('Return condition:'),
        },
      })
    })

    it('should reject if loan not found', async () => {
      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/loans/invalid-id/return', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ returnDate: new Date() }),
      })

      const response = await returnLoanHandler(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Loan not found')
    })

    it('should reject if loan already returned', async () => {
      const mockLoan = {
        id: 'loan123',
        userId: mockUserId,
        status: LoanStatus.RETURNED,
        returnDate: new Date('2024-01-10'),
      }

      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan)

      const request = new NextRequest('http://localhost/api/loans/loan123/return', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ returnDate: new Date() }),
      })

      const response = await returnLoanHandler(request, { params: { id: 'loan123' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Loan already returned')
    })

    it('should reject if user does not own the loan', async () => {
      const mockLoan = {
        id: 'loan123',
        userId: 'different-user',
        status: LoanStatus.ACTIVE,
      }

      ;(prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan)

      const request = new NextRequest('http://localhost/api/loans/loan123/return', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ returnDate: new Date() }),
      })

      const response = await returnLoanHandler(request, { params: { id: 'loan123' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })
  })
})