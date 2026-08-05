import { ChevronRight, Trash2 } from 'lucide-react'

import { getComponentIcon } from '@/lib/component-icons'
import { getComponentMeta } from '@/lib/component-manifest'
import type { ComponentField, Flow, FlowStep } from '@/lib/component-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'

interface StepInspectorProps {
  flow: Flow
  selectedStepId: string | null
  onSelectStep: (stepId: string) => void
  onUpdateStep: (stepId: string, key: string, value: string | number | boolean) => void
  onDeleteStep: (stepId: string) => void
  onClose: () => void
}

function Field({
  field,
  value,
  onChange,
}: {
  field: ComponentField
  value: string | number | boolean | undefined
  onChange: (value: string | number | boolean) => void
}) {
  const current = value ?? field.default ?? (field.type === 'boolean' ? false : '')

  if (field.type === 'select') {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{field.label}</Label>
        <Select value={String(current)} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Switch checked={Boolean(current)} onCheckedChange={onChange} />
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{field.label}</Label>
        <Input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={current as number | string}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      <Input value={current as string} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function StepSummaryRow({
  step,
  onClick,
}: {
  step: FlowStep
  onClick: () => void
}) {
  const meta = getComponentMeta(step.type)
  const Icon = getComponentIcon(step.type)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
    >
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="flex-1 truncate">{meta?.label ?? step.type}</span>
      <ChevronRight className="size-3.5 text-muted-foreground" />
    </button>
  )
}

export function StepInspector({
  flow,
  selectedStepId,
  onSelectStep,
  onUpdateStep,
  onDeleteStep,
  onClose,
}: StepInspectorProps) {
  const selectedStep = flow.steps.find((s) => s.id === selectedStepId) ?? null
  const meta = selectedStep ? getComponentMeta(selectedStep.type) : undefined
  const otherSteps = flow.steps.filter((s) => s.id !== selectedStepId)

  return (
    <Sheet open={Boolean(selectedStep)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-3/4 flex-col gap-0 p-0 sm:max-w-sm">
        {selectedStep && meta && (
          <>
            <SheetHeader className="border-b border-border">
              <div className="flex items-center gap-2">
                <Badge variant="accent">{meta.category === 'trigger' ? 'Trigger' : 'Media'}</Badge>
                <SheetTitle>{meta.label}</SheetTitle>
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
              <p className="text-xs text-muted-foreground">{meta.description}</p>
              {meta.fields.map((field) => (
                <Field
                  key={field.key}
                  field={field}
                  value={selectedStep.config[field.key]}
                  onChange={(value) => onUpdateStep(selectedStep.id, field.key, value)}
                />
              ))}

              <Separator />

              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDeleteStep(selectedStep.id)}
              >
                <Trash2 className="size-4" />
                Remove step
              </Button>
            </div>

            {otherSteps.length > 0 && (
              <div className="border-t border-border px-2 py-2">
                <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Other steps</p>
                {otherSteps.map((step) => (
                  <StepSummaryRow key={step.id} step={step} onClick={() => onSelectStep(step.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
