import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import type { UserRole } from '@prisma/client'

export interface TokenPayload {
  userId: string
  role: UserRole
  email: string
  name: string
}

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Server-side: get current user from cookie (async in Next.js 16)
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

// Server-side: require auth or throw
export async function requireAuth(): Promise<TokenPayload> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

// Require specific role
export async function requireRole(...roles: UserRole[]): Promise<TokenPayload> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) throw new Error('Forbidden')
  return user
}
