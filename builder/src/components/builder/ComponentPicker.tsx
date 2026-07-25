import { componentManifest } from '@/lib/component-manifest'
import { getComponentIcon } from '@/lib/component-icons'
import type { ComponentCategory } from '@/lib/component-types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface ComponentPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ComponentCategory
  onSelect: (type: string) => void
}

const categoryLabels: Record<ComponentCategory, string> = {
  trigger: 'Trigger',
  media: 'Media',
}

export function ComponentPicker({ open, onOpenChange, category, onSelect }: ComponentPickerProps) {
  const components = category
    ? componentManifest.filter((c) => c.category === category)
    : componentManifest

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-3/4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add a {category ? categoryLabels[category] : ''} component</SheetTitle>
          <SheetDescription>
            Pick a component to add as the next step in this flow.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-4">
          {components.map((component) => {
            const Icon = getComponentIcon(component.type)
            return (
              <button
                key={component.type}
                type="button"
                onClick={() => {
                  onSelect(component.type)
                  onOpenChange(false)
                }}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-4.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{component.label}</span>
                  <span className="text-xs text-muted-foreground">{component.description}</span>
                </div>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
