import { ArrowRightLeft, ArrowUp, Ban, Blend, ZoomIn, type LucideIcon } from 'lucide-react'

import type { TransitionType } from './component-types'

const iconsByType: Record<TransitionType, LucideIcon> = {
  none: Ban,
  fade: Blend,
  'slide-left': ArrowRightLeft,
  'slide-up': ArrowUp,
  zoom: ZoomIn,
}

export function getTransitionIcon(type: TransitionType | undefined): LucideIcon {
  return iconsByType[type ?? 'none']
}
