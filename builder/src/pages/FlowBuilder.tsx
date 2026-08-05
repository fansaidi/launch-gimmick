import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, UploadCloud } from 'lucide-react'
import { ReactFlow, ReactFlowProvider, Background, Controls, type Edge, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { getComponentMeta } from '@/lib/component-manifest'
import type { ComponentCategory } from '@/lib/component-types'
import { useFlowStore } from '@/store/useFlowStore'
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

const saveStatusLabel: Record<string, string> = {
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Failed to save',
}

export function FlowBuilder() {
  const { flowId } = useParams()

  const currentFlow = useFlowStore((s) => s.currentFlow)
  const currentFlowStatus = useFlowStore((s) => s.currentFlowStatus)
  const currentFlowError = useFlowStore((s) => s.currentFlowError)
  const saveStatus = useFlowStore((s) => s.saveStatus)
  const selectedStepId = useFlowStore((s) => s.selectedStepId)
  const fetchFlow = useFlowStore((s) => s.fetchFlow)
  const selectStep = useFlowStore((s) => s.selectStep)
  const addStep = useFlowStore((s) => s.addStep)
  const updateStepConfig = useFlowStore((s) => s.updateStepConfig)
  const deleteStep = useFlowStore((s) => s.deleteStep)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerCategory, setPickerCategory] = useState<ComponentCategory | undefined>(undefined)
  const [insertIndex, setInsertIndex] = useState(0)

  useEffect(() => {
    if (flowId) fetchFlow(flowId)
  }, [flowId, fetchFlow])

  function openPicker(category: ComponentCategory | undefined, index: number) {
    setPickerCategory(category)
    setInsertIndex(index)
    setPickerOpen(true)
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

    currentFlow?.steps.forEach((step, index) => {
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

    addAddNode(currentFlow?.steps.length ?? 0)

    return { nodes, edges }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFlow?.steps, selectedStepId])

  if (currentFlowStatus === 'loading' || !currentFlow) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
        {currentFlowStatus === 'error' ? `Couldn't load flow: ${currentFlowError}` : 'Loading…'}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <Button variant="ghost" size="icon" asChild className="size-8">
          <Link to="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentFlow.name}</span>
          <div className="flex items-center gap-1">
            {[...new Set(currentFlow.steps.map((s) => getComponentMeta(s.type)?.label).filter(Boolean))].map(
              (label) => (
                <Badge key={label} variant="secondary" className="font-normal">
                  {label}
                </Badge>
              ),
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {saveStatus !== 'idle' && (
            <span
              className={`text-xs ${saveStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {saveStatusLabel[saveStatus]}
            </span>
          )}
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
        <ComponentRail onOpenPicker={(category) => openPicker(category, currentFlow.steps.length)} />

        <div className="min-w-0 flex-1 bg-background">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => {
                if (node.type === 'step') selectStep(node.id)
              }}
              onPaneClick={() => selectStep(null)}
              fitView
              fitViewOptions={{ maxZoom: 1 }}
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{ style: { stroke: 'var(--border)', strokeWidth: 2 } }}
            >
              <Background gap={20} color="var(--border)" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      <StepInspector
        flow={currentFlow}
        selectedStepId={selectedStepId}
        onSelectStep={selectStep}
        onUpdateStep={updateStepConfig}
        onDeleteStep={deleteStep}
        onClose={() => selectStep(null)}
      />

      <ComponentPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        category={pickerCategory}
        onSelect={(type) => addStep(type, insertIndex)}
      />
    </div>
  )
}
