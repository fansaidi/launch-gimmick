import 'dotenv/config'

import { db } from './db/client.js'
import { flows } from './db/schema.js'

// Mirrors the player app's defaultFlow/eventLaunchFlow (src/js/flows/*.js).
// Usage: tsx src/seed.ts <user-id>
const userId = process.argv[2]
if (!userId) {
  console.error('Usage: tsx src/seed.ts <user-id>')
  process.exit(1)
}

await db.insert(flows).values([
  {
    userId,
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
    userId,
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
])

console.log('Seeded 2 flows for user', userId)
process.exit(0)
