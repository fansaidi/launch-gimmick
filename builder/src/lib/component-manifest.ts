import type { ComponentMeta } from './component-types'

// Mirrors the `meta` exported by each step module in the player app
// (../../../src/js/flow/steps/*.js). Duplicated here for now since the
// player and builder are separate apps with no shared package yet - once
// flows are persisted through a real API (phase 3), this should be served
// from the same registry the player uses instead of hand-kept in sync.
export const componentManifest: ComponentMeta[] = [
  {
    type: 'trigger.faceExpression',
    category: 'trigger',
    label: 'Face Expression',
    description:
      'Waits for the viewer to hold a facial expression (smile, surprise, anger, ...) for a set duration.',
    fields: [
      {
        key: 'expression',
        label: 'Expression to detect',
        type: 'select',
        options: ['happy', 'sad', 'angry', 'surprised', 'disgusted', 'fearful', 'neutral'],
        default: 'happy',
      },
      { key: 'threshold', label: 'Confidence threshold', type: 'number', min: 0, max: 1, step: 0.05, default: 0.75 },
      { key: 'holdMs', label: 'Hold duration (ms)', type: 'number', min: 500, step: 500, default: 3000 },
      { key: 'scanVideoSrc', label: 'Scanning overlay video (optional)', type: 'text' },
      { key: 'scanAudioSrc', label: 'Scanning sound (optional)', type: 'text' },
    ],
  },
  {
    type: 'trigger.button',
    category: 'trigger',
    label: 'Tap Button',
    description: 'A simple tap/click target. Useful as the opening "start" step, or anywhere a gesture isn\'t wanted.',
    fields: [{ key: 'label', label: 'Button label', type: 'text', default: 'Start' }],
  },
  {
    type: 'media.video',
    category: 'media',
    label: 'Video',
    description:
      'Plays a full-bleed video file (e.g. an uploaded mp4). Use for an intro/loading screen or a reward reveal. For a YouTube link, use Video Embed instead.',
    fields: [
      { key: 'src', label: 'Video file URL', type: 'text', required: true },
      { key: 'loop', label: 'Loop', type: 'boolean', default: false },
      { key: 'muted', label: 'Muted', type: 'boolean', default: true },
      { key: 'autoAdvance', label: 'Advance automatically when the video ends', type: 'boolean', default: true },
    ],
  },
  {
    type: 'media.embed',
    category: 'media',
    label: 'Video Embed',
    description:
      "Embeds a video from YouTube using YouTube's own player. For a direct video file (e.g. an uploaded mp4), use Video instead.",
    fields: [
      { key: 'src', label: 'YouTube URL', type: 'text', required: true },
      { key: 'loop', label: 'Loop', type: 'boolean', default: false },
      { key: 'muted', label: 'Muted', type: 'boolean', default: true },
      { key: 'autoAdvance', label: 'Advance automatically when the video ends', type: 'boolean', default: true },
    ],
  },
]

export function getComponentMeta(type: string): ComponentMeta | undefined {
  return componentManifest.find((c) => c.type === type)
}
