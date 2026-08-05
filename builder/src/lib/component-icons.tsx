import { MonitorPlay, MousePointerClick, Smile, Video, Zap, type LucideIcon } from 'lucide-react'

const iconsByType: Record<string, LucideIcon> = {
  'trigger.faceExpression': Smile,
  'trigger.button': MousePointerClick,
  'media.video': Video,
  'media.embed': MonitorPlay,
}

export function getComponentIcon(type: string): LucideIcon {
  return iconsByType[type] ?? Zap
}
