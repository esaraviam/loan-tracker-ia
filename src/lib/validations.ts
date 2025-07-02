import { z } from "zod"

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
})

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loanSchema = z.object({
  recipientName: z
    .string()
    .min(1, "Recipient name is required")
    .max(100, "Recipient name must be less than 100 characters"),
  itemName: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name must be less than 100 characters"),
  description: z.string().optional(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
  borrowedAt: z.string().refine((date) => {
    const borrowDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return borrowDate <= today
  }, "Loan date cannot be in the future"),
  returnBy: z.string(),
  stateStart: z
    .string()
    .min(1, "Initial condition is required")
    .max(200, "Initial condition must be less than 200 characters"),
}).refine((data) => {
  const borrowDate = new Date(data.borrowedAt)
  const returnDate = new Date(data.returnBy)
  return returnDate > borrowDate
}, {
  message: "Return date must be after loan date",
  path: ["returnBy"],
})

export const returnLoanSchema = z.object({
  stateEnd: z
    .string()
    .min(1, "Final condition is required")
    .max(200, "Final condition must be less than 200 characters"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type NewPasswordInput = z.infer<typeof newPasswordSchema>
export type LoanInput = z.infer<typeof loanSchema>
export type ReturnLoanInput = z.infer<typeof returnLoanSchema>