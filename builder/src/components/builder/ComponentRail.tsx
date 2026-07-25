import { LayoutGrid, HelpCircle, Settings, Video, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ComponentCategory } from '@/lib/component-types'

interface ComponentRailProps {
  onOpenPicker: (category?: ComponentCategory) => void
}

const railItems: { icon: typeof Zap; label: string; category?: ComponentCategory }[] = [
  { icon: LayoutGrid, label: 'All components' },
  { icon: Zap, label: 'Trigger components', category: 'trigger' },
  { icon: Video, label: 'Media components', category: 'media' },
]

export function ComponentRail({ onOpenPicker }: ComponentRailProps) {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center justify-between border-r border-border bg-card py-3">
      <div className="flex flex-col items-center gap-1">
        {railItems.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            onClick={() => onOpenPicker(item.category)}
            className={cn(
              'flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <item.icon className="size-4.5" />
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          title="Help"
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <HelpCircle className="size-4.5" />
        </button>
        <button
          type="button"
          title="Settings"
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="size-4.5" />
        </button>
      </div>
    </div>
  )
}
