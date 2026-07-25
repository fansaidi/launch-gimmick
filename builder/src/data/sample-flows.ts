import type { Flow } from '@/lib/component-types'

// Mirrors src/js/flows/*.js from the player app. Standing in for saved
// projects until flows are persisted through a real API (phase 3).
export const sampleFlows: Flow[] = [
  {
    id: 'smile-to-reveal',
    name: 'Smile to Reveal',
    steps: [
      {
        id: 'step-1',
        type: 'trigger.faceExpression',
        config: {
          expression: 'happy',
          threshold: 0.75,
          holdMs: 3000,
          scanVideoSrc: '/media/smile_scan.mp4',
          scanAudioSrc: '/audio/scanning.mp3',
        },
      },
      {
        id: 'step-2',
        type: 'media.video',
        config: {
          src: 'https://res.cloudinary.com/dzwzi3idm/video/upload/v1731441767/montage_rajwis.mp4',
          autoAdvance: false,
        },
      },
    ],
  },
  {
    id: 'event-launch',
    name: 'Event Launch',
    steps: [
      { id: 'step-1', type: 'trigger.button', config: { label: 'Tap to Begin' } },
      { id: 'step-2', type: 'media.video', config: { src: '/media/smile_scan.mp4', autoAdvance: true } },
      {
        id: 'step-3',
        type: 'trigger.faceExpression',
        config: {
          expression: 'surprised',
          threshold: 0.6,
          holdMs: 3000,
          scanVideoSrc: '/media/smile_scan.mp4',
          scanAudioSrc: '/audio/scanning.mp3',
        },
      },
      {
        id: 'step-4',
        type: 'media.video',
        config: {
          src: 'https://res.cloudinary.com/dzwzi3idm/video/upload/v1731441767/montage_rajwis.mp4',
          autoAdvance: false,
        },
      },
    ],
  },
]
