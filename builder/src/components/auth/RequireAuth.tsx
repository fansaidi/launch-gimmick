import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-sm">
          <p className="mb-2 font-medium">Supabase isn't configured yet</p>
          <p className="text-muted-foreground">
            Set <code className="text-foreground">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-foreground">VITE_SUPABASE_PUBLISHABLE_KEY</code> in{' '}
            <code className="text-foreground">builder/.env</code> (see{' '}
            <code className="text-foreground">.env.example</code>), then reload.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading…</div>
  }

  if (status === 'signed-out') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
