import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { User } from "@prisma/client"

const JWT_SECRET = process.env["JWT_SECRET"]
const JWT_EXPIRE_TIME = process.env["JWT_EXPIRE_TIME"] || "7d"

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production")
  }
  console.warn("WARNING: Using insecure default JWT secret for development only")
}

export interface JWTPayload {
  userId: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  const secret = JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined)
  if (!secret) {
    throw new Error("JWT_SECRET is required")
  }
  return jwt.sign(payload, secret, { 
    expiresIn: JWT_EXPIRE_TIME as jwt.SignOptions['expiresIn']
  })
}

export function verifyToken(token: string): JWTPayload {
  const secret = JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined)
  if (!secret) {
    throw new Error("JWT_SECRET is required")
  }
  return jwt.verify(token, secret) as JWTPayload
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get("auth-token")?.value
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getAuthCookie()
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload || !payload.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
