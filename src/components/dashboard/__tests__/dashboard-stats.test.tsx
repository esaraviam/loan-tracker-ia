import React from 'react'
import { render, screen } from '@testing-library/react'
import { DashboardStats } from '../dashboard-stats'

describe('DashboardStats Component', () => {
  const mockStats = {
    totalLoans: 25,
    activeLoans: 10,
    overdueLoans: 3,
    returnedLoans: 12,
    totalValue: 5750.50,
    overdueValue: 1200.00,
  }

  it('renders all stat cards', () => {
    render(<DashboardStats stats={mockStats} />)

    expect(screen.getByText('Total Loans')).toBeInTheDocument()
    expect(screen.getByText('Active Loans')).toBeInTheDocument()
    expect(screen.getByText('Overdue Loans')).toBeInTheDocument()
    expect(screen.getByText('Returned Loans')).toBeInTheDocument()
  })

  it('displays correct stat values', () => {
    render(<DashboardStats stats={mockStats} />)

    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    render(<DashboardStats stats={mockStats} />)

    expect(screen.getByText('$5,750.50')).toBeInTheDocument()
    expect(screen.getByText('$1,200.00')).toBeInTheDocument()
  })

  it('shows correct icons for each stat', () => {
    render(<DashboardStats stats={mockStats} />)

    // Check for icon elements by their parent card titles
    const totalCard = screen.getByText('Total Loans').closest('.card')
    const activeCard = screen.getByText('Active Loans').closest('.card')
    const overdueCard = screen.getByText('Overdue Loans').closest('.card')
    const returnedCard = screen.getByText('Returned Loans').closest('.card')

    expect(totalCard?.querySelector('svg')).toBeInTheDocument()
    expect(activeCard?.querySelector('svg')).toBeInTheDocument()
    expect(overdueCard?.querySelector('svg')).toBeInTheDocument()
    expect(returnedCard?.querySelector('svg')).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    const zeroStats = {
      totalLoans: 0,
      activeLoans: 0,
      overdueLoans: 0,
      returnedLoans: 0,
      totalValue: 0,
      overdueValue: 0,
    }

    render(<DashboardStats stats={zeroStats} />)

    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(4)
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('uses responsive grid layout', () => {
    const { container } = render(<DashboardStats stats={mockStats} />)
    
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-4')
  })

  it('displays loading state when stats are undefined', () => {
    render(<DashboardStats stats={undefined} />)
    
    // Should show skeleton loaders or loading indicators
    const cards = screen.getAllByRole('article')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('highlights overdue stats when present', () => {
    render(<DashboardStats stats={mockStats} />)
    
    const overdueCard = screen.getByText('Overdue Loans').closest('[role="article"]')
    const overdueValue = screen.getByText('3')
    
    // Check if overdue card has warning styling
    expect(overdueCard).toBeInTheDocument()
    expect(overdueValue.className).toMatch(/text-(red|destructive)/)
  })

  it('shows percentage calculations', () => {
    render(<DashboardStats stats={mockStats} />)
    
    // Active percentage: 10/25 = 40%
    expect(screen.getByText('40% of total')).toBeInTheDocument()
    
    // Overdue percentage: 3/25 = 12%
    expect(screen.getByText('12% of total')).toBeInTheDocument()
    
    // Returned percentage: 12/25 = 48%
    expect(screen.getByText('48% of total')).toBeInTheDocument()
  })

  it('handles large numbers with proper formatting', () => {
    const largeStats = {
      totalLoans: 1000000,
      activeLoans: 500000,
      overdueLoans: 50000,
      returnedLoans: 450000,
      totalValue: 1000000000,
      overdueValue: 50000000,
    }

    render(<DashboardStats stats={largeStats} />)
    
    expect(screen.getByText('1,000,000')).toBeInTheDocument()
    expect(screen.getByText('$1,000,000,000.00')).toBeInTheDocument()
  })
})