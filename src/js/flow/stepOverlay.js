import { mountChromaKeyEffect } from '../services/chromaKeyEffect.js'

// Mounts an optional "build anticipation" overlay - a looping video,
// optionally chroma-keyed, plus optional looping sound - behind whatever a
// step renders. Generic across step types (unlike the old bespoke scan
// video that only trigger.faceExpression had): FlowEngine mounts/unmounts
// this alongside a step's own render()/destroy() lifecycle, based on the
// step's `overlay` config. Returns null when the step has no overlay.
export function mountStepOverlay(container, overlay) {
  if (!overlay?.videoSrc) return null

  const { videoSrc, audioSrc, chromaKey, chromaKeyColor, delayMs = 0 } = overlay

  const wrapper = document.createElement('div')
  wrapper.className = 'step-overlay'

  const video = document.createElement('video')
  video.className = chromaKey ? 'step-overlay-video step-overlay-video-hidden' : 'step-overlay-video'
  video.src = videoSrc
  video.loop = true
  video.muted = true
  video.playsInline = true
  wrapper.appendChild(video)

  const canvas = chromaKey ? document.createElement('canvas') : null
  if (canvas) {
    canvas.className = 'step-overlay-canvas'
    wrapper.appendChild(canvas)
  }

  const audio = audioSrc ? document.createElement('audio') : null
  if (audio) {
    audio.src = audioSrc
    audio.loop = true
    wrapper.appendChild(audio)
  }

  // Sits behind the step's own content, matching the original scan-video
  // effect - the step renders first, this is prepended so it paints under it.
  container.insertBefore(wrapper, container.firstChild)

  let chromaEffect = null
  const delayTimer = setTimeout(() => {
    video.play().catch(() => {})
    audio?.play().catch(() => {})
    if (canvas) {
      chromaEffect = mountChromaKeyEffect(canvas, video, { keyColor: chromaKeyColor })
      chromaEffect.start()
    }
  }, delayMs)

  return {
    stop() {
      clearTimeout(delayTimer)
      chromaEffect?.stop()
      video.pause()
      audio?.pause()
      wrapper.remove()
    },
  }
}
