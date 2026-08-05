import { Handle, Position, type NodeProps } from '@xyflow/react'

import { getComponentIcon } from '@/lib/component-icons'
import { getComponentMeta } from '@/lib/component-manifest'
import type { FlowStep } from '@/lib/component-types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StepNodeData = { step: FlowStep }

function summarize(step: FlowStep): string[] {
  switch (step.type) {
    case 'trigger.faceExpression':
      return [String(step.config.expression ?? 'happy'), `${step.config.holdMs ?? 3000}ms`]
    case 'trigger.button':
      return [String(step.config.label ?? 'Start')]
    case 'media.video':
    case 'media.embed':
      return [step.config.autoAdvance === false ? 'tap to advance' : 'auto-advance']
    default:
      return []
  }
}

export function StepNode({ data, selected }: NodeProps & { data: StepNodeData }) {
  const { step } = data
  const meta = getComponentMeta(step.type)
  const Icon = getComponentIcon(step.type)

  return (
    <div
      className={cn(
        'w-56 rounded-lg border bg-card shadow-sm transition-colors',
        selected ? 'border-primary ring-2 ring-primary/30' : 'border-border',
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />

      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-accent text-accent-foreground">
          <Icon className="size-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{meta?.category === 'trigger' ? 'Trigger' : 'Media'}</span>
          <span className="text-sm font-medium leading-tight">{meta?.label ?? step.type}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 px-3 py-2">
        {summarize(step).map((value) => (
          <Badge key={value} variant="secondary" className="font-normal">
            {value}
          </Badge>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  )
}
