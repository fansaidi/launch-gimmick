import { Fragment } from 'react'
import { Plus } from 'lucide-react'

import { getComponentIcon } from '@/lib/component-icons'
import { getComponentMeta } from '@/lib/component-manifest'
import { getTransitionIcon } from '@/lib/transition-icons'
import { DEFAULT_TRANSITION_DURATION, transitionLabel, transitionOptions } from '@/lib/transitions'
import type { Flow, FlowStep, StepTransition } from '@/lib/component-types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ScenePreview } from './ScenePreview'

interface TimelineViewProps {
  flow: Flow
  selectedStepId: string | null
  onSelectStep: (stepId: string) => void
  onInsertStep: (index: number) => void
  onUpdateTransition: (stepId: string, transition: StepTransition | undefined) => void
}

const speedPresets = [
  { label: 'Fast', duration: 250 },
  { label: 'Normal', duration: DEFAULT_TRANSITION_DURATION },
  { label: 'Slow', duration: 900 },
]

function AddSceneButton({ onClick, size = 'sm' }: { onClick: () => void; size?: 'sm' | 'lg' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Add a scene"
      className={cn(
        'flex aspect-video shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-muted-foreground/40 text-muted-foreground transition-colors hover:border-primary hover:text-primary',
        size === 'lg' ? 'w-56' : 'w-14',
      )}
    >
      <Plus className={size === 'lg' ? 'size-6' : 'size-4'} />
      {size === 'lg' && <span className="text-xs font-medium">Add your first scene</span>}
    </button>
  )
}

function SceneCard({
  step,
  index,
  selected,
  onClick,
}: {
  step: FlowStep
  index: number
  selected: boolean
  onClick: () => void
}) {
  const meta = getComponentMeta(step.type)
  const Icon = getComponentIcon(step.type)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-56 shrink-0 flex-col overflow-hidden rounded-lg border bg-card text-left shadow-sm transition-colors',
        selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40',
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <ScenePreview step={step} />
        <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded bg-black/60 text-[10px] font-medium text-white">
          {index + 1}
        </span>
      </div>
      <div className="flex items-center gap-1.5 border-t border-border px-2 py-1.5">
        <div className="flex size-5 shrink-0 items-center justify-center rounded bg-accent text-accent-foreground">
          <Icon className="size-3" />
        </div>
        <span className="truncate text-xs font-medium">{meta?.label ?? step.type}</span>
      </div>
    </button>
  )
}

function TransitionConnector({
  transition,
  onChange,
  onInsert,
}: {
  transition: StepTransition | undefined
  onChange: (transition: StepTransition | undefined) => void
  onInsert: () => void
}) {
  const Icon = getTransitionIcon(transition?.type)
  const active = Boolean(transition && transition.type !== 'none')

  return (
    <div className="group relative flex w-12 shrink-0 flex-col items-center justify-center">
      <button
        type="button"
        onClick={onInsert}
        title="Insert a scene here"
        className="absolute -top-7 flex size-5 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground opacity-0 transition-opacity hover:border-primary hover:text-primary group-hover:opacity-100"
      >
        <Plus className="size-3" />
      </button>

      <div className="h-px w-4 bg-border" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title={transitionLabel(transition?.type)}
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary',
              active ? 'border-primary/60 bg-primary/10 text-primary' : 'border-dashed border-muted-foreground/50',
            )}
          >
            <Icon className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-44">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Transition</DropdownMenuLabel>
          {transitionOptions.map((option) => (
            <DropdownMenuItem
              key={option.type}
              onSelect={() =>
                onChange(
                  option.type === 'none'
                    ? undefined
                    : { type: option.type, duration: transition?.duration ?? DEFAULT_TRANSITION_DURATION },
                )
              }
            >
              {option.label}
              {(transition?.type ?? 'none') === option.type && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          ))}

          {active && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Speed</DropdownMenuLabel>
              {speedPresets.map((preset) => (
                <DropdownMenuItem
                  key={preset.label}
                  onSelect={() => onChange({ type: transition!.type, duration: preset.duration })}
                >
                  {preset.label}
                  {transition?.duration === preset.duration && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="h-px w-4 bg-border" />
    </div>
  )
}

export function TimelineView({ flow, selectedStepId, onSelectStep, onInsertStep, onUpdateTransition }: TimelineViewProps) {
  if (flow.steps.length === 0) {
    return (
      <div className="flex size-full items-center justify-center">
        <AddSceneButton size="lg" onClick={() => onInsertStep(0)} />
      </div>
    )
  }

  return (
    <div className="size-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-fit items-center gap-3 px-8">
        <AddSceneButton onClick={() => onInsertStep(0)} />

        {flow.steps.map((step, index) => (
          <Fragment key={step.id}>
            {index > 0 && (
              <TransitionConnector
                transition={step.transition}
                onChange={(t) => onUpdateTransition(step.id, t)}
                onInsert={() => onInsertStep(index)}
              />
            )}
            <SceneCard
              step={step}
              index={index}
              selected={step.id === selectedStepId}
              onClick={() => onSelectStep(step.id)}
            />
          </Fragment>
        ))}

        <AddSceneButton onClick={() => onInsertStep(flow.steps.length)} />
      </div>
    </div>
  )
}
