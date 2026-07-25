import type { NextFunction, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set')
}

// Service-role client used only to verify user access tokens - never
// exposed to clients, never used to bypass RLS on their behalf.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' })
    return
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.userId = data.user.id
  next()
}
