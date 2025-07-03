import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Clean existing test user
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' }
    })
    
    // Create new test user
    const passwordHash = await bcrypt.hash('Password123', 12)
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash
      }
    })
    
    console.log('✅ Test user created:', user.email)
    console.log('📧 Email: test@example.com')
    console.log('🔑 Password: Password123')
    console.log('\n🌐 Now visit http://localhost:3000/login to test the login flow')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()