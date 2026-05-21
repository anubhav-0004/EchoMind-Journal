import { Request } from 'express'
import { verifyToken, TokenPayload } from '../lib/auth'

export interface Context {
  user: TokenPayload | null
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) return { user: null }

  try {
    const user = verifyToken(token)
    return { user }
  } catch {
    return { user: null }
  }
}

export function requireAuth(ctx: Context): asserts ctx is Context & { user: TokenPayload } {
  if (!ctx.user) {
    throw new Error('You must be logged in to do this')
  }
}

export function requireAdmin(ctx: Context) {
  requireAuth(ctx)
  if (ctx.user!.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
}