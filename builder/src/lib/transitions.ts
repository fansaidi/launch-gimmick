import type { StepTransition, TransitionType } from './component-types'

// Mirrors the transition types the player's FlowEngine knows how to
// animate (../../../src/js/flow/transitions.js).
export interface TransitionOption {
  type: TransitionType
  label: string
}

export const transitionOptions: TransitionOption[] = [
  { type: 'none', label: 'Cut (no transition)' },
  { type: 'fade', label: 'Fade' },
  { type: 'slide-left', label: 'Slide' },
  { type: 'slide-up', label: 'Slide up' },
  { type: 'zoom', label: 'Zoom' },
]

export const DEFAULT_TRANSITION_DURATION = 500

export const DEFAULT_TRANSITION: StepTransition = { type: 'fade', duration: DEFAULT_TRANSITION_DURATION }

export function transitionLabel(type: TransitionType | undefined): string {
  return transitionOptions.find((o) => o.type === (type ?? 'none'))?.label ?? 'Cut (no transition)'
}
