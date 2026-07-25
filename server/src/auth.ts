import type { NextFunction, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const supabaseUrl = process.env.SUPABASE_URL
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set')
}

// Verifies the JWT's signature locally against Supabase's published
// signing keys instead of round-tripping to Supabase Auth on every
// request. jose caches/refreshes the key set on its own.
const jwks = createRemoteJWKSet(new URL('/auth/v1/.well-known/jwks.json', supabaseUrl))

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' })
    return
  }

  try {
    const { payload } = await jwtVerify(token, jwks)
    if (typeof payload.sub !== 'string') throw new Error('Token missing sub claim')
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}
