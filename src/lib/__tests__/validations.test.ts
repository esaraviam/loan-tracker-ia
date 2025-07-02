import {
  registerSchema,
  loginSchema,
  loanSchema,
  updateLoanSchema,
  returnLoanSchema,
  exportSchema,
  categorySchema
} from "@/lib/validations"

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        name: "John Doe",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!"
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "Password123!",
        confirmPassword: "Password123!"
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email')
      }
    })

    it("should reject mismatched passwords", () => {
      const invalidData = {
        name: "John Doe",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Different123!"
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Passwords')
      }
    })

    it("should reject password without uppercase", () => {
      const invalidData = {
        name: "John Doe",
        email: "test@example.com",
        password: "password123!",
        confirmPassword: "password123!"
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject password without number", () => {
      const invalidData = {
        name: "John Doe",
        email: "test@example.com",
        password: "PasswordABC!",
        confirmPassword: "PasswordABC!"
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject password shorter than 8 characters", () => {
      const invalidData = {
        name: "John Doe",
        email: "test@example.com",
        password: "Pass1!",
        confirmPassword: "Pass1!"
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!"
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should trim whitespace from name and email", () => {
      const dataWithSpaces = {
        name: "  John Doe  ",
        email: "  test@example.com  ",
        password: "Password123!",
        confirmPassword: "Password123!"
      }
      
      const result = registerSchema.safeParse(dataWithSpaces)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("John Doe")
        expect(result.data.email).toBe("test@example.com")
      }
    })
  })

  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "anyPassword123"
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123"
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject empty password", () => {
      const invalidData = {
        email: "test@example.com",
        password: ""
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject missing fields", () => {
      const result = loginSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it("should trim email whitespace", () => {
      const dataWithSpaces = {
        email: "  test@example.com  ",
        password: "password123"
      }
      
      const result = loginSchema.safeParse(dataWithSpaces)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe("test@example.com")
      }
    })
  })

  describe("loanSchema", () => {
    it("should validate correct loan data", () => {
      const validData = {
        borrowerName: "John Doe",
        borrowerEmail: "john@example.com",
        borrowerPhone: "1234567890",
        itemDescription: "JavaScript Book",
        amount: 150.50,
        loanDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        categoryId: "cat123",
        notes: "Advanced JS patterns book"
      }
      
      const result = loanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should accept loan without optional fields", () => {
      const validData = {
        borrowerName: "John Doe",
        borrowerEmail: "john@example.com",
        borrowerPhone: "1234567890",
        itemDescription: "Book",
        amount: 100,
        loanDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        categoryId: "cat123"
      }
      
      const result = loanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject negative amount", () => {
      const invalidData = {
        borrowerName: "John Doe",
        borrowerEmail: "john@example.com",
        borrowerPhone: "1234567890",
        itemDescription: "Book",
        amount: -50,
        loanDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        categoryId: "cat123"
      }
      
      const result = loanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject zero amount", () => {
      const invalidData = {
        borrowerName: "John Doe",
        borrowerEmail: "john@example.com",
        borrowerPhone: "1234567890",
        itemDescription: "Book",
        amount: 0,
        loanDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        categoryId: "cat123"
      }
      
      const result = loanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject due date before loan date", () => {
      const invalidData = {
        borrowerName: "John Doe",
        borrowerEmail: "john@example.com",
        borrowerPhone: "1234567890",
        itemDescription: "Book",
        amount: 100,
        loanDate: new Date("2024-02-01"),
        dueDate: new Date("2024-01-01"),
        categoryId: "cat123"
      }
      
      const result = loanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('due date')
      }
    })

    it("should reject empty borrower name", () => {
      const invalidData = {
        borrowerName: "",
        borrowerEmail: "john@example.com",
        borrowerPhone: "1234567890",
        itemDescription: "Book",
        amount: 100,
        loanDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        categoryId: "cat123"
      }
      
      const result = loanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should reject invalid email format", () => {
      const invalidData = {
        borrowerName: "John Doe",
        borrowerEmail: "invalid-email",
        borrowerPhone: "1234567890",
        itemDescription: "Book",
        amount: 100,
        loanDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        categoryId: "cat123"
      }
      
      const result = loanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should accept various phone formats", () => {
      const phoneFormats = [
        "1234567890",
        "(123) 456-7890",
        "123-456-7890",
        "+1 123 456 7890"
      ]

      phoneFormats.forEach(phone => {
        const data = {
          borrowerName: "John Doe",
          borrowerEmail: "john@example.com",
          borrowerPhone: phone,
          itemDescription: "Book",
          amount: 100,
          loanDate: new Date("2024-01-01"),
          dueDate: new Date("2024-02-01"),
          categoryId: "cat123"
        }
        
        const result = loanSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe("updateLoanSchema", () => {
    it("should validate partial updates", () => {
      const validData = {
        amount: 200,
        notes: "Updated notes"
      }
      
      const result = updateLoanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should accept empty update", () => {
      const result = updateLoanSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it("should validate all fields when provided", () => {
      const validData = {
        borrowerName: "Jane Doe",
        borrowerEmail: "jane@example.com",
        borrowerPhone: "9876543210",
        itemDescription: "Updated item",
        amount: 300,
        dueDate: new Date("2024-03-01"),
        notes: "Updated all fields"
      }
      
      const result = updateLoanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid updates", () => {
      const invalidData = {
        amount: -100,
        borrowerEmail: "not-an-email"
      }
      
      const result = updateLoanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe("returnLoanSchema", () => {
    it("should validate correct return data", () => {
      const validData = {
        returnDate: new Date("2024-01-15"),
        condition: "Good condition, minor wear"
      }
      
      const result = returnLoanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should require return date", () => {
      const invalidData = {
        condition: "Good condition"
      }
      
      const result = returnLoanSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should accept return without condition notes", () => {
      const validData = {
        returnDate: new Date("2024-01-15")
      }
      
      const result = returnLoanSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe("exportSchema", () => {
    it("should validate export with all parameters", () => {
      const validData = {
        format: "csv",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        status: "ACTIVE"
      }
      
      const result = exportSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should accept only format parameter", () => {
      const validData = {
        format: "json"
      }
      
      const result = exportSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject invalid format", () => {
      const invalidData = {
        format: "xml"
      }
      
      const result = exportSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should validate all format options", () => {
      const formats = ["csv", "json", "pdf"]
      
      formats.forEach(format => {
        const result = exportSchema.safeParse({ format })
        expect(result.success).toBe(true)
      })
    })

    it("should reject end date before start date", () => {
      const invalidData = {
        format: "csv",
        startDate: new Date("2024-12-31"),
        endDate: new Date("2024-01-01")
      }
      
      const result = exportSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should validate status filter", () => {
      const statuses = ["ACTIVE", "OVERDUE", "RETURNED"]
      
      statuses.forEach(status => {
        const result = exportSchema.safeParse({ 
          format: "csv",
          status 
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe("categorySchema", () => {
    it("should validate category creation", () => {
      const validData = {
        name: "Electronics",
        description: "Electronic devices and gadgets"
      }
      
      const result = categorySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should accept category without description", () => {
      const validData = {
        name: "Books"
      }
      
      const result = categorySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        description: "Some description"
      }
      
      const result = categorySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it("should trim whitespace from name", () => {
      const dataWithSpaces = {
        name: "  Electronics  ",
        description: "Devices"
      }
      
      const result = categorySchema.safeParse(dataWithSpaces)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Electronics")
      }
    })
  })
})