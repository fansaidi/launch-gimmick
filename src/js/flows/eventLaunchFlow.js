// Demonstrates the same step types rearranged into a different flow, and a
// different expression configured on the face-detection trigger:
// activation (button) -> intro (video) -> action (surprised face) -> reward (video).
export const eventLaunchFlow = {
  id: 'event-launch',
  name: 'Event Launch',
  steps: [
    {
      type: 'trigger.button',
      config: { label: 'Tap to Begin' },
    },
    {
      type: 'media.video',
      config: {
        src: `${import.meta.env.BASE_URL}media/smile_scan.mp4`,
        autoAdvance: true,
      },
    },
    {
      type: 'trigger.faceExpression',
      config: { expression: 'surprised', threshold: 0.6, holdMs: 3000 },
      overlay: {
        videoSrc: `${import.meta.env.BASE_URL}media/smile_scan.mp4`,
        audioSrc: `${import.meta.env.BASE_URL}audio/scanning.mp3`,
        chromaKey: true,
      },
    },
    {
      type: 'media.video',
      config: {
        src: 'https://res.cloudinary.com/dzwzi3idm/video/upload/v1731441767/montage_rajwis.mp4',
        autoAdvance: false,
      },
    },
  ],
}
