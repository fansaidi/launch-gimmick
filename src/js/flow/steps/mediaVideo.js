export const meta = {
  type: 'media.video',
  category: 'media',
  label: 'Video',
  description: 'Plays a full-bleed video. Use for an intro/loading screen or a reward reveal.',
  fields: [
    { key: 'src', label: 'Video URL', type: 'text', required: true },
    { key: 'loop', label: 'Loop', type: 'boolean', default: false },
    { key: 'muted', label: 'Muted', type: 'boolean', default: true },
    { key: 'autoAdvance', label: 'Advance automatically when the video ends', type: 'boolean', default: true },
  ],
}

// Intro/reward step: plays a full-bleed video. Completes automatically when
// the video ends, or on tap when `autoAdvance` is false (e.g. a reward the
// user dismisses themselves).
export function render(container, config) {
  const { src, loop = false, autoAdvance = true, muted = true } = config

  container.innerHTML = `
    <div class="step step-media-video">
      <video class="media-video" src="${src}" ${loop ? 'loop' : ''} ${muted ? 'muted' : ''} autoplay playsinline></video>
    </div>
  `
  const video = container.querySelector('.media-video')

  return {
    start(onComplete) {
      video.play().catch(() => {})
      if (autoAdvance) {
        video.addEventListener('ended', onComplete, { once: true })
      } else {
        video.addEventListener('click', onComplete, { once: true })
      }
    },
    destroy() {
      video.pause()
      container.innerHTML = ''
    },
  }
}
