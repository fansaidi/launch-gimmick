// Reproduces the original app's behavior: hold a smile for 3s (with the
// scanning overlay + sound), then reveal the montage.
export const defaultFlow = {
  id: 'smile-to-reveal',
  name: 'Smile to Reveal',
  steps: [
    {
      type: 'trigger.faceExpression',
      config: {
        expression: 'happy',
        threshold: 0.75,
        holdMs: 3000,
        scanVideoSrc: `${import.meta.env.BASE_URL}media/smile_scan.mp4`,
        scanAudioSrc: `${import.meta.env.BASE_URL}audio/scanning.mp3`,
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
