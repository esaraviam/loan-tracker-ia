import { hashPassword, comparePassword, generateToken, verifyToken } from '../auth'
import jwt from 'jsonwebtoken'

// Mock jsonwebtoken
jest.mock('jsonwebtoken')

describe('Auth utilities', () => {
  const mockPassword = 'testPassword123!'
  const mockUserId = 'test-user-id'
  const mockEmail = 'test@example.com'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const hashedPassword = await hashPassword(mockPassword)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(mockPassword)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(mockPassword)
      const hash2 = await hashPassword(mockPassword)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow()
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const hashedPassword = await hashPassword(mockPassword)
      const isMatch = await comparePassword(mockPassword, hashedPassword)
      
      expect(isMatch).toBe(true)
    })

    it('should return false for non-matching password', async () => {
      const hashedPassword = await hashPassword(mockPassword)
      const isMatch = await comparePassword('wrongPassword', hashedPassword)
      
      expect(isMatch).toBe(false)
    })

    it('should handle empty strings', async () => {
      const hashedPassword = await hashPassword(mockPassword)
      const isMatch = await comparePassword('', hashedPassword)
      
      expect(isMatch).toBe(false)
    })
  })

  describe('generateToken', () => {
    const mockToken = 'mock.jwt.token'

    beforeEach(() => {
      ;(jwt.sign as jest.Mock).mockReturnValue(mockToken)
    })

    it('should generate a token with user data', () => {
      const token = generateToken(mockUserId, mockEmail)
      
      expect(token).toBe(mockToken)
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserId, email: mockEmail },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
    })

    it('should use JWT_SECRET from environment', () => {
      const originalSecret = process.env.JWT_SECRET
      process.env.JWT_SECRET = 'test-secret'
      
      generateToken(mockUserId, mockEmail)
      
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'test-secret',
        expect.any(Object)
      )
      
      process.env.JWT_SECRET = originalSecret
    })
  })

  describe('verifyToken', () => {
    const mockDecodedToken = {
      userId: mockUserId,
      email: mockEmail,
      iat: 1234567890,
      exp: 1234567890
    }

    it('should verify and decode a valid token', () => {
      ;(jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken)
      
      const decoded = verifyToken('valid.token')
      
      expect(decoded).toEqual(mockDecodedToken)
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid.token',
        process.env.JWT_SECRET
      )
    })

    it('should throw error for invalid token', () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })
      
      expect(() => verifyToken('invalid.token')).toThrow('Invalid token')
    })

    it('should handle expired tokens', () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date())
      })
      
      expect(() => verifyToken('expired.token')).toThrow()
    })
  })
})