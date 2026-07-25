import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, UploadCloud } from 'lucide-react'
import { ReactFlow, ReactFlowProvider, Background, Controls, type Edge, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { sampleFlows } from '@/data/sample-flows'
import { getComponentMeta } from '@/lib/component-manifest'
import type { ComponentCategory, Flow, FlowStep } from '@/lib/component-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ComponentRail } from '@/components/builder/ComponentRail'
import { ComponentPicker } from '@/components/builder/ComponentPicker'
import { StepInspector } from '@/components/builder/StepInspector'
import { StepNode, type StepNodeData } from '@/components/builder/StepNode'
import { AddStepNode, type AddStepNodeData } from '@/components/builder/AddStepNode'

const nodeTypes = { step: StepNode, add: AddStepNode }

const STEP_HEIGHT = 140
const ADD_HEIGHT = 70

function createStep(type: string): FlowStep {
  const meta = getComponentMeta(type)
  const config: FlowStep['config'] = {}
  meta?.fields.forEach((field) => {
    if (field.default !== undefined) config[field.key] = field.default
  })
  return { id: `step-${Date.now()}-${Math.round(Math.random() * 1000)}`, type, config }
}

export function FlowBuilder() {
  const { flowId } = useParams()
  const initialFlow = useMemo<Flow>(
    () =>
      sampleFlows.find((f) => f.id === flowId) ?? {
        id: flowId ?? 'new',
        name: 'Untitled Flow',
        steps: [],
      },
    [flowId],
  )

  const [flow, setFlow] = useState<Flow>(initialFlow)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerCategory, setPickerCategory] = useState<ComponentCategory | undefined>(undefined)
  const [insertIndex, setInsertIndex] = useState<number>(flow.steps.length)

  function openPicker(category: ComponentCategory | undefined, index: number) {
    setPickerCategory(category)
    setInsertIndex(index)
    setPickerOpen(true)
  }

  function handleAddStep(type: string) {
    const step = createStep(type)
    setFlow((f) => {
      const steps = [...f.steps]
      steps.splice(insertIndex, 0, step)
      return { ...f, steps }
    })
    setSelectedStepId(step.id)
  }

  function handleUpdateStep(stepId: string, key: string, value: string | number | boolean) {
    setFlow((f) => ({
      ...f,
      steps: f.steps.map((s) => (s.id === stepId ? { ...s, config: { ...s.config, [key]: value } } : s)),
    }))
  }

  function handleDeleteStep(stepId: string) {
    setFlow((f) => ({ ...f, steps: f.steps.filter((s) => s.id !== stepId) }))
    setSelectedStepId(null)
  }

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    let y = 0
    let previousId: string | null = null

    function addAddNode(index: number) {
      const id = `add-${index}`
      nodes.push({
        id,
        type: 'add',
        position: { x: 0, y },
        data: { onClick: () => openPicker(undefined, index) } satisfies AddStepNodeData,
        draggable: false,
        selectable: false,
      })
      if (previousId) edges.push({ id: `${previousId}-${id}`, source: previousId, target: id })
      previousId = id
      y += ADD_HEIGHT
    }

    flow.steps.forEach((step, index) => {
      addAddNode(index)
      nodes.push({
        id: step.id,
        type: 'step',
        position: { x: 0, y },
        data: { step } satisfies StepNodeData,
        draggable: false,
        selected: step.id === selectedStepId,
      })
      if (previousId) edges.push({ id: `${previousId}-${step.id}`, source: previousId, target: step.id })
      previousId = step.id
      y += STEP_HEIGHT
    })

    addAddNode(flow.steps.length)

    return { nodes, edges }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.steps, selectedStepId])

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <Button variant="ghost" size="icon" asChild className="size-8">
          <Link to="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{flow.name}</span>
          <div className="flex items-center gap-1">
            {[...new Set(flow.steps.map((s) => getComponentMeta(s.type)?.label).filter(Boolean))].map(
              (label) => (
                <Badge key={label} variant="secondary" className="font-normal">
                  {label}
                </Badge>
              ),
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline">
            <Play className="size-4" />
            Preview
          </Button>
          <Button>
            <UploadCloud className="size-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <ComponentRail onOpenPicker={(category) => openPicker(category, flow.steps.length)} />

        <div className="min-w-0 flex-1 bg-background">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => {
                if (node.type === 'step') setSelectedStepId(node.id)
              }}
              onPaneClick={() => setSelectedStepId(null)}
              fitView
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{ style: { stroke: 'var(--border)', strokeWidth: 2 } }}
            >
              <Background gap={20} color="var(--border)" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        <StepInspector
          flow={flow}
          selectedStepId={selectedStepId}
          onSelectStep={setSelectedStepId}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
          onClose={() => setSelectedStepId(null)}
        />
      </div>

      <ComponentPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        category={pickerCategory}
        onSelect={handleAddStep}
      />
    </div>
  )
}
