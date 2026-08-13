export type FieldType = 'text' | 'number' | 'select' | 'boolean'

export interface ComponentField {
  key: string
  label: string
  type: FieldType
  default?: string | number | boolean
  options?: string[]
  min?: number
  max?: number
  step?: number
  required?: boolean
}

export type ComponentCategory = 'trigger' | 'media'

export interface ComponentMeta {
  type: string
  category: ComponentCategory
  label: string
  description: string
  fields: ComponentField[]
}

export type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-up' | 'zoom'

export interface StepTransition {
  type: TransitionType
  duration: number
}

// A "build anticipation" layer that plays behind a step's own content for
// as long as that step is active - e.g. a looping scan/sparkle video while
// a trigger waits for the viewer. See src/js/flow/stepOverlay.js (player).
export interface StepOverlay {
  videoSrc: string
  audioSrc?: string
  chromaKey?: boolean
  // Hex color to key out when chromaKey is on, e.g. "#00ff00".
  chromaKeyColor?: string
  // How long to wait after the step mounts before the overlay starts
  // playing, in ms.
  delayMs?: number
}

export interface FlowStep {
  id: string
  type: string
  config: Record<string, string | number | boolean | undefined>
  // How this step enters, coming from the previous one. Irrelevant (and
  // ignored) on the first step, since there's nothing before it to
  // transition from.
  transition?: StepTransition
  overlay?: StepOverlay
}

export interface Flow {
  id: string
  name: string
  steps: FlowStep[]
  published: boolean
}
