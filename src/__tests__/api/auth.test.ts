import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as loginHandler } from '@/app/api/auth/login/route'
import { POST as logoutHandler } from '@/app/api/auth/logout/route'
import { GET as meHandler } from '@/app/api/auth/me/route'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
}))

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
      ;(hashPassword as jest.Mock).mockResolvedValue('hashedPassword')

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User registered successfully')
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedPassword',
        },
      })
    })

    it('should reject registration with existing email', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing',
        email: 'john@example.com',
      })

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
    })

    it('should validate registration data', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          email: 'invalid-email',
          password: 'weak',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('validation')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
        password: 'hashedPassword',
        name: 'John Doe',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(require('@/lib/auth').comparePassword as jest.Mock).mockResolvedValue(true)
      ;(require('@/lib/auth').generateToken as jest.Mock).mockReturnValue('mock-token')

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual({
        id: 'user123',
        email: 'john@example.com',
        name: 'John Doe',
      })
      expect(response.headers.get('Set-Cookie')).toContain('auth-token=mock-token')
    })

    it('should reject login with invalid email', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'password123',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })

    it('should reject login with wrong password', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
        password: 'hashedPassword',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(require('@/lib/auth').comparePassword as jest.Mock).mockResolvedValue(false)

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'wrongPassword',
        }),
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should clear auth cookie on logout', async () => {
      const request = new NextRequest('http://localhost/api/auth/logout', {
        method: 'POST',
      })

      const response = await logoutHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Logged out successfully')
      
      const setCookie = response.headers.get('Set-Cookie')
      expect(setCookie).toContain('auth-token=')
      expect(setCookie).toContain('Max-Age=0')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data when authenticated', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(require('@/lib/auth').verifyToken as jest.Mock).mockReturnValue({
        userId: 'user123',
        email: 'john@example.com',
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost/api/auth/me', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      })

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual({
        id: 'user123',
        email: 'john@example.com',
        name: 'John Doe',
      })
    })

    it('should return 401 when not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/auth/me')

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })

    it('should handle invalid token', async () => {
      ;(require('@/lib/auth').verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = new NextRequest('http://localhost/api/auth/me', {
        headers: {
          cookie: 'auth-token=invalid-token',
        },
      })

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid token')
    })
  })
})