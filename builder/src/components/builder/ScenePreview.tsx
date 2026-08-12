import { Play } from 'lucide-react'

import { getComponentIcon } from '@/lib/component-icons'
import type { FlowStep } from '@/lib/component-types'
import { cn } from '@/lib/utils'

// Mirrors src/js/services/youtube.js's extractYouTubeId - duplicated here
// for the same reason the component manifest is (see component-manifest.ts):
// the builder and player are separate apps with no shared package yet.
function extractYouTubeId(url: string | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

// Renders what a scene will actually show in the player, so the timeline
// reads as a real filmstrip rather than a row of icons - a live <video> for
// Video steps, the real YouTube thumbnail for Video Embed, a mock of the
// tap button, and a stylized placeholder for the camera-based trigger
// (there's nothing meaningful to preview there ahead of time - it only
// renders once a real camera feed is attached).
export function ScenePreview({ step, className }: { step: FlowStep; className?: string }) {
  const Icon = getComponentIcon(step.type)

  switch (step.type) {
    case 'media.video': {
      const src = step.config.src as string | undefined
      return (
        <div className={cn('flex size-full items-center justify-center bg-black', className)}>
          {src ? (
            <video src={src} className="size-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <Icon className="size-6 text-white/40" />
          )}
        </div>
      )
    }

    case 'media.embed': {
      const videoId = extractYouTubeId(step.config.src as string | undefined)
      return (
        <div className={cn('relative flex size-full items-center justify-center bg-black', className)}>
          {videoId ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <Icon className="size-6 text-white/40" />
          )}
          {videoId && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="flex size-8 items-center justify-center rounded-full bg-black/60">
                <Play className="size-4 fill-white text-white" />
              </div>
            </div>
          )}
        </div>
      )
    }

    case 'trigger.button': {
      const label = (step.config.label as string) || 'Start'
      return (
        <div className={cn('flex size-full items-center justify-center bg-black', className)}>
          <span className="truncate rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black">
            {label}
          </span>
        </div>
      )
    }

    case 'trigger.faceExpression': {
      const expression = (step.config.expression as string) || 'happy'
      return (
        <div
          className={cn(
            'flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-neutral-700 to-black',
            className,
          )}
        >
          <Icon className="size-5 text-white/70" />
          <span className="text-[10px] font-medium capitalize text-white/70">{expression}</span>
        </div>
      )
    }

    default:
      return (
        <div className={cn('flex size-full items-center justify-center bg-black', className)}>
          <Icon className="size-6 text-white/40" />
        </div>
      )
  }
}
