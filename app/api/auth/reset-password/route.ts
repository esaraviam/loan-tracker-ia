import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPasswordSchema } from "@/lib/validations"
import { z } from "zod"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    // Always return success even if user doesn't exist (security)
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a reset link.",
      })
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour
    
    // Save reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    })
    
    // In a real application, you would send an email here
    // For this demo, we'll just log the reset link
    console.log(`Password reset link: ${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`)
    
    return NextResponse.json({
      message: "If an account exists with this email, you will receive a reset link.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }
    
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}