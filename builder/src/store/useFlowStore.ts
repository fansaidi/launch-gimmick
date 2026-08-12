import { create } from 'zustand'

import { api } from '@/lib/api'
import { getComponentMeta } from '@/lib/component-manifest'
import type { Flow, FlowStep, StepTransition } from '@/lib/component-types'

type AsyncStatus = 'idle' | 'loading' | 'error'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface FlowState {
  flows: Flow[]
  flowsStatus: AsyncStatus
  flowsError: string | null

  currentFlow: Flow | null
  currentFlowStatus: AsyncStatus
  currentFlowError: string | null
  saveStatus: SaveStatus

  selectedStepId: string | null

  fetchFlows: () => Promise<void>
  fetchFlow: (id: string) => Promise<void>
  createFlow: (name: string) => Promise<Flow>
  deleteFlow: (id: string) => Promise<void>
  renameFlow: (name: string) => void
  publishFlow: () => Promise<void>
  selectStep: (stepId: string | null) => void
  addStep: (type: string, index: number) => void
  updateStepConfig: (stepId: string, key: string, value: string | number | boolean) => void
  updateStepTransition: (stepId: string, transition: StepTransition | undefined) => void
  deleteStep: (stepId: string) => void
}

function createStep(type: string): FlowStep {
  const meta = getComponentMeta(type)
  const config: FlowStep['config'] = {}
  meta?.fields.forEach((field) => {
    if (field.default !== undefined) config[field.key] = field.default
  })
  return { id: `step-${Date.now()}-${Math.round(Math.random() * 1000)}`, type, config }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave(get: () => FlowState, set: (partial: Partial<FlowState>) => void) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    const flow = get().currentFlow
    if (!flow) return
    set({ saveStatus: 'saving' })
    try {
      await api.updateFlow(flow.id, { name: flow.name, steps: flow.steps })
      set({ saveStatus: 'saved' })
    } catch (err) {
      console.error(err)
      set({ saveStatus: 'error' })
    }
  }, 600)
}

export const useFlowStore = create<FlowState>((set, get) => ({
  flows: [],
  flowsStatus: 'idle',
  flowsError: null,

  currentFlow: null,
  currentFlowStatus: 'idle',
  currentFlowError: null,
  saveStatus: 'idle',

  selectedStepId: null,

  fetchFlows: async () => {
    set({ flowsStatus: 'loading', flowsError: null })
    try {
      const flows = await api.listFlows()
      set({ flows, flowsStatus: 'idle' })
    } catch (err) {
      set({ flowsStatus: 'error', flowsError: (err as Error).message })
    }
  },

  fetchFlow: async (id) => {
    set({ currentFlowStatus: 'loading', currentFlowError: null, currentFlow: null, selectedStepId: null })
    try {
      const flow = await api.getFlow(id)
      set({ currentFlow: flow, currentFlowStatus: 'idle' })
    } catch (err) {
      set({ currentFlowStatus: 'error', currentFlowError: (err as Error).message })
    }
  },

  createFlow: async (name) => {
    const flow = await api.createFlow({ name, steps: [] })
    set((state) => ({ flows: [flow, ...state.flows] }))
    return flow
  },

  deleteFlow: async (id) => {
    await api.deleteFlow(id)
    set((state) => ({ flows: state.flows.filter((f) => f.id !== id) }))
  },

  renameFlow: (name) => {
    set((state) => (state.currentFlow ? { currentFlow: { ...state.currentFlow, name } } : {}))
    scheduleSave(get, set)
  },

  publishFlow: async () => {
    const flow = get().currentFlow
    if (!flow) return
    const published = !flow.published
    // Applied immediately (not debounced like field edits) since this is a
    // deliberate, explicit action rather than incidental typing.
    const updated = await api.updateFlow(flow.id, { published })
    set((state) => (state.currentFlow ? { currentFlow: { ...state.currentFlow, published: updated.published } } : {}))
  },

  selectStep: (stepId) => set({ selectedStepId: stepId }),

  addStep: (type, index) => {
    const step = createStep(type)
    set((state) => {
      if (!state.currentFlow) return {}
      const steps = [...state.currentFlow.steps]
      steps.splice(index, 0, step)
      return { currentFlow: { ...state.currentFlow, steps }, selectedStepId: step.id }
    })
    scheduleSave(get, set)
  },

  updateStepConfig: (stepId, key, value) => {
    set((state) => {
      if (!state.currentFlow) return {}
      const steps = state.currentFlow.steps.map((s) =>
        s.id === stepId ? { ...s, config: { ...s.config, [key]: value } } : s,
      )
      return { currentFlow: { ...state.currentFlow, steps } }
    })
    scheduleSave(get, set)
  },

  updateStepTransition: (stepId, transition) => {
    set((state) => {
      if (!state.currentFlow) return {}
      const steps = state.currentFlow.steps.map((s) => (s.id === stepId ? { ...s, transition } : s))
      return { currentFlow: { ...state.currentFlow, steps } }
    })
    scheduleSave(get, set)
  },

  deleteStep: (stepId) => {
    set((state) => {
      if (!state.currentFlow) return {}
      const steps = state.currentFlow.steps.filter((s) => s.id !== stepId)
      return { currentFlow: { ...state.currentFlow, steps }, selectedStepId: null }
    })
    scheduleSave(get, set)
  },
}))
