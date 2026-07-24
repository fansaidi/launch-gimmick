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
