import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecentLoans } from '../recent-loans'
import { LoanStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('RecentLoans Component', () => {
  const mockPush = jest.fn()
  
  const mockLoans = [
    {
      id: '1',
      borrowerName: 'John Doe',
      borrowerEmail: 'john@example.com',
      borrowerPhone: '1234567890',
      itemDescription: 'JavaScript Book',
      amount: 50,
      loanDate: new Date('2024-01-01'),
      dueDate: new Date('2024-02-01'),
      returnDate: null,
      notes: null,
      photos: [],
      status: LoanStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      categoryId: 'cat1',
      category: { id: 'cat1', name: 'Books', description: null }
    },
    {
      id: '2',
      borrowerName: 'Jane Smith',
      borrowerEmail: 'jane@example.com',
      borrowerPhone: '0987654321',
      itemDescription: 'Laptop',
      amount: 1000,
      loanDate: new Date('2024-01-10'),
      dueDate: new Date('2024-01-15'),
      returnDate: null,
      notes: null,
      photos: [],
      status: LoanStatus.OVERDUE,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      categoryId: 'cat2',
      category: { id: 'cat2', name: 'Electronics', description: null }
    },
    {
      id: '3',
      borrowerName: 'Bob Wilson',
      borrowerEmail: 'bob@example.com',
      borrowerPhone: '5555555555',
      itemDescription: 'Camera',
      amount: 500,
      loanDate: new Date('2024-01-05'),
      dueDate: new Date('2024-01-20'),
      returnDate: new Date('2024-01-18'),
      notes: null,
      photos: [],
      status: LoanStatus.RETURNED,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
      categoryId: 'cat2',
      category: { id: 'cat2', name: 'Electronics', description: null }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it('renders recent loans table', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    expect(screen.getByText('Recent Loans')).toBeInTheDocument()
    expect(screen.getByText('View all')).toBeInTheDocument()
  })

  it('displays loan data correctly', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    // Check borrower names
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    
    // Check items
    expect(screen.getByText('JavaScript Book')).toBeInTheDocument()
    expect(screen.getByText('Laptop')).toBeInTheDocument()
    expect(screen.getByText('Camera')).toBeInTheDocument()
    
    // Check amounts
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText('$500.00')).toBeInTheDocument()
  })

  it('shows correct status badges', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    const activeBadge = screen.getByText('Active')
    const overdueBadge = screen.getByText('Overdue')
    const returnedBadge = screen.getByText('Returned')
    
    expect(activeBadge).toHaveClass('bg-primary')
    expect(overdueBadge).toHaveClass('bg-destructive')
    expect(returnedBadge).toHaveClass('bg-secondary')
  })

  it('formats dates correctly', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument()
    expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument()
    expect(screen.getByText('Jan 5, 2024')).toBeInTheDocument()
  })

  it('navigates to loan detail on row click', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    const firstRow = screen.getByText('John Doe').closest('tr')
    fireEvent.click(firstRow!)
    
    expect(mockPush).toHaveBeenCalledWith('/loans/1')
  })

  it('navigates to loans page on "View all" click', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    const viewAllButton = screen.getByText('View all')
    fireEvent.click(viewAllButton)
    
    expect(mockPush).toHaveBeenCalledWith('/loans')
  })

  it('shows empty state when no loans', () => {
    render(<RecentLoans loans={[]} />)
    
    expect(screen.getByText('No recent loans')).toBeInTheDocument()
    expect(screen.getByText('Start by creating your first loan')).toBeInTheDocument()
  })

  it('limits display to 5 most recent loans', () => {
    const manyLoans = Array.from({ length: 10 }, (_, i) => ({
      ...mockLoans[0],
      id: `loan-${i}`,
      borrowerName: `Borrower ${i}`,
    }))
    
    render(<RecentLoans loans={manyLoans} />)
    
    const rows = screen.getAllByRole('row')
    // Header row + 5 data rows
    expect(rows).toHaveLength(6)
  })

  it('shows overdue indicator for overdue loans', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    const overdueRow = screen.getByText('Jane Smith').closest('tr')
    expect(overdueRow).toHaveClass('hover:bg-red-50')
  })

  it('displays category information', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    expect(screen.getByText('Books')).toBeInTheDocument()
    expect(screen.getAllByText('Electronics')).toHaveLength(2)
  })

  it('handles missing category gracefully', () => {
    const loansWithoutCategory = [{
      ...mockLoans[0],
      category: null,
      categoryId: null
    }]
    
    render(<RecentLoans loans={loansWithoutCategory} />)
    
    expect(screen.getByText('Uncategorized')).toBeInTheDocument()
  })

  it('shows loading skeleton when loans are loading', () => {
    render(<RecentLoans loans={undefined} loading={true} />)
    
    const skeletons = screen.getAllByTestId('skeleton-row')
    expect(skeletons).toHaveLength(5)
  })

  it('handles click on action buttons', () => {
    render(<RecentLoans loans={mockLoans} />)
    
    const viewButtons = screen.getAllByText('View')
    fireEvent.click(viewButtons[0])
    
    expect(mockPush).toHaveBeenCalledWith('/loans/1')
  })
})