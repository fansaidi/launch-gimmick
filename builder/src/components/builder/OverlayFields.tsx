import type { StepOverlay } from '@/lib/component-types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const DEFAULT_CHROMA_COLOR = '#00ff00'

interface OverlayFieldsProps {
  overlay: StepOverlay | undefined
  onChange: (overlay: StepOverlay | undefined) => void
}

// Config for the "build anticipation" overlay a scene can play behind its
// own content for as long as it's active (e.g. a looping scan video while
// a trigger waits) - see src/js/flow/stepOverlay.js on the player side.
export function OverlayFields({ overlay, onChange }: OverlayFieldsProps) {
  function update(patch: Partial<StepOverlay>) {
    onChange({ videoSrc: '', ...overlay, ...patch })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>Overlay while this scene plays</Label>
        <Switch
          checked={Boolean(overlay)}
          onCheckedChange={(checked) => onChange(checked ? { videoSrc: '', delayMs: 0 } : undefined)}
        />
      </div>

      {overlay && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <div className="flex flex-col gap-1.5">
            <Label>Overlay video URL</Label>
            <Input value={overlay.videoSrc} onChange={(e) => update({ videoSrc: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Overlay sound (optional)</Label>
            <Input value={overlay.audioSrc ?? ''} onChange={(e) => update({ audioSrc: e.target.value })} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Chroma key (remove green background)</Label>
            <Switch checked={Boolean(overlay.chromaKey)} onCheckedChange={(checked) => update({ chromaKey: checked })} />
          </div>

          {overlay.chromaKey && (
            <div className="flex items-center justify-between">
              <Label>Key color</Label>
              <input
                type="color"
                value={overlay.chromaKeyColor ?? DEFAULT_CHROMA_COLOR}
                onChange={(e) => update({ chromaKeyColor: e.target.value })}
                className="h-8 w-14 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Start delay (ms)</Label>
            <Input
              type="number"
              min={0}
              step={100}
              value={overlay.delayMs ?? 0}
              onChange={(e) => update({ delayMs: e.target.valueAsNumber })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
