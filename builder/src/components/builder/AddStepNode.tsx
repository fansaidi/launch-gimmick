import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Plus } from 'lucide-react'

export type AddStepNodeData = { onClick: () => void }

export function AddStepNode({ data }: NodeProps & { data: AddStepNodeData }) {
  return (
    <div className="flex w-56 items-center justify-center">
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <button
        type="button"
        onClick={data.onClick}
        title="Add a step"
        className="flex size-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-4" />
      </button>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  )
}
