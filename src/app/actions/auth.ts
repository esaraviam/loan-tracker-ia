"use server"

// import { cookies } from "next/headers" // Not used directly, but used by auth functions
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  setAuthCookie,
  removeAuthCookie,
  getCurrentUser 
} from "@/lib/auth"
import { loginSchema, registerSchema } from "@/lib/validations"

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = loginSchema.parse({ email, password })
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    if (!user) {
      return {
        success: false,
        error: "Invalid credentials"
      }
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.passwordHash
    )
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid credentials"
      }
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })
    
    // Set auth cookie
    await setAuthCookie(token)
    
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        }
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid input"
      }
    }
    
    console.error("Login error:", error)
    return {
      success: false,
      error: "Something went wrong"
    }
  }
}

export async function registerAction(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = registerSchema.parse({ email, password })
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    if (existingUser) {
      return {
        success: false,
        error: "Email already registered"
      }
    }
    
    // Hash password
    const passwordHash = await hashPassword(validatedData.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
      },
    })
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })
    
    // Set auth cookie
    await setAuthCookie(token)
    
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        }
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid input"
      }
    }
    
    console.error("Register error:", error)
    return {
      success: false,
      error: "Something went wrong"
    }
  }
}

export async function logoutAction(): Promise<void> {
  await removeAuthCookie()
  redirect("/")
}

export async function getCurrentUserAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return {
        success: false,
        error: "Not authenticated"
      }
    }
    
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
      }
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      success: false,
      error: "Failed to get user"
    }
  }
}