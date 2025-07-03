#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')
  await prisma.loanPhoto.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Database cleaned')
}

async function testAuth() {
  console.log('\n🔐 Testing Authentication...')
  
  // Import the server actions
  const { registerAction, loginAction, getCurrentUserAction } = await import('./src/app/actions/auth.ts')
  
  // Test registration
  console.log('📝 Testing registration...')
  const registerResult = await registerAction('test@example.com', 'Password123')
  
  if (registerResult.success) {
    console.log('✅ Registration successful:', registerResult.data)
  } else {
    console.log('❌ Registration failed:', registerResult.error)
    return false
  }
  
  // Test login
  console.log('🔑 Testing login...')
  const loginResult = await loginAction('test@example.com', 'Password123')
  
  if (loginResult.success) {
    console.log('✅ Login successful:', loginResult.data)
  } else {
    console.log('❌ Login failed:', loginResult.error)
    return false
  }
  
  return true
}

async function testLoans() {
  console.log('\n📦 Testing Loans...')
  
  // Get test user
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  })
  
  if (!user) {
    console.log('❌ Test user not found')
    return false
  }
  
  // Create a test loan directly in database
  console.log('📝 Creating test loan...')
  const loan = await prisma.loan.create({
    data: {
      userId: user.id,
      recipientName: 'John Doe',
      itemName: 'Test Book',
      description: 'A test book for testing',
      quantity: 1,
      borrowedAt: new Date(),
      returnBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      stateStart: 'Good condition'
    }
  })
  
  console.log('✅ Loan created:', loan.id)
  
  return true
}

async function testDashboard() {
  console.log('\n📊 Testing Dashboard...')
  
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  })
  
  if (!user) {
    console.log('❌ Test user not found')
    return false
  }
  
  // Count loans
  const loansCount = await prisma.loan.count({
    where: { userId: user.id }
  })
  
  console.log(`✅ Found ${loansCount} loans for test user`)
  
  return true
}

async function main() {
  try {
    console.log('🚀 Starting Server Actions tests...')
    
    // Clean database first
    await cleanDatabase()
    
    // Run tests
    const authPassed = await testAuth()
    if (!authPassed) {
      console.error('❌ Auth tests failed')
      process.exit(1)
    }
    
    const loansPassed = await testLoans()
    if (!loansPassed) {
      console.error('❌ Loans tests failed')
      process.exit(1)
    }
    
    const dashboardPassed = await testDashboard()
    if (!dashboardPassed) {
      console.error('❌ Dashboard tests failed')
      process.exit(1)
    }
    
    console.log('\n✅ All tests passed!')
    
  } catch (error) {
    console.error('❌ Test error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()