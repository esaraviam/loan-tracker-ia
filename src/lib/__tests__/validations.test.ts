import {
  registerSchema,
  loginSchema,
  loanSchema,
  returnLoanSchema,
} from "@/lib/validations"

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "Password123",
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject password without uppercase", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject password without number", () => {
      const invalidData = {
        email: "test@example.com",
        password: "PasswordABC",
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject password shorter than 8 characters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Pass1",
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("loanSchema", () => {
    it("should validate correct loan data", () => {
      const validData = {
        recipientName: "John Doe",
        itemName: "JavaScript Book",
        description: "Advanced JS patterns",
        quantity: 1,
        borrowedAt: "2024-01-01",
        returnBy: "2024-02-01",
        stateStart: "Good condition",
      }
      
      const result = loanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject quantity less than 1", () => {
      const invalidData = {
        recipientName: "John Doe",
        itemName: "Book",
        quantity: 0,
        borrowedAt: "2024-01-01",
        returnBy: "2024-02-01",
        stateStart: "Good",
      }
      
      const result = loanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject return date before loan date", () => {
      const invalidData = {
        recipientName: "John Doe",
        itemName: "Book",
        quantity: 1,
        borrowedAt: "2024-02-01",
        returnBy: "2024-01-01",
        stateStart: "Good",
      }
      
      const result = loanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("returnLoanSchema", () => {
    it("should validate correct return data", () => {
      const validData = {
        stateEnd: "Returned in good condition",
      }
      
      const result = returnLoanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject empty state end", () => {
      const invalidData = {
        stateEnd: "",
      }
      
      const result = returnLoanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})