import { Outlet } from 'react-router-dom'

import { RequireAuth } from '@/components/auth/RequireAuth'
import { TopNav } from '@/components/layout/TopNav'

export function AppLayout() {
  return (
    <RequireAuth>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        <TopNav />
        <Outlet />
      </div>
    </RequireAuth>
  )
}
