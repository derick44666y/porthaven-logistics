import jwt from 'jsonwebtoken'

const rawSecret = process.env.JWT_SECRET

if (process.env.NODE_ENV === 'production' && !rawSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production')
}

// Non-null for TypeScript; in production the guard above guarantees it is set.
const SECRET: string = rawSecret || 'dev-only-insecure-secret'

export interface JwtPayload {
  userId: string
  email: string
  role: 'CUSTOMER' | 'ADMIN'
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}