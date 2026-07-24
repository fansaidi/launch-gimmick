import * as faceapi from 'face-api.js'
import { cameraMotionService } from '../../services/cameraMotionService.js'
import { mountChromaKeyEffect } from '../../services/chromaKeyEffect.js'

// Activation/action step: waits for the user to hold a smile for `holdMs`
// before completing. Optionally overlays a looping "scanning" video (chroma
// keyed) and sound behind the live camera feed.
export function render(container, config) {
  const {
    threshold = 0.75,
    holdMs = 3000,
    scanVideoSrc,
    scanAudioSrc,
  } = config

  container.innerHTML = `
    <div class="step step-trigger-smile video-container">
      ${scanVideoSrc ? '<canvas class="chroma-canvas"></canvas>' : ''}
      <div class="cam-container">
        <div class="countdown-display"></div>
        <video class="input-video" autoplay muted playsinline></video>
        <canvas class="overlay"></canvas>
      </div>
      ${scanVideoSrc ? `<video class="bg-scan-video" src="${scanVideoSrc}" autoplay loop muted playsinline></video>` : ''}
      ${scanAudioSrc ? `<audio class="scan-audio" src="${scanAudioSrc}"></audio>` : ''}
    </div>
  `

  const videoEl = container.querySelector('.input-video')
  const overlayEl = container.querySelector('.overlay')
  const countdownEl = container.querySelector('.countdown-display')
  const scanAudioEl = container.querySelector('.scan-audio')
  const chromaCanvas = container.querySelector('.chroma-canvas')
  const bgScanVideo = container.querySelector('.bg-scan-video')

  let countdownTimer = null
  let isCountingDown = false
  let faceWatcher = null
  let chromaEffect = null
  let wasSmiling = false

  function startCountdown(onComplete) {
    if (isCountingDown) return
    isCountingDown = true
    let secondsLeft = Math.round(holdMs / 1000)
    countdownEl.textContent = secondsLeft
    scanAudioEl?.play()

    countdownTimer = setInterval(() => {
      secondsLeft -= 1
      countdownEl.textContent = secondsLeft
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer)
        countdownTimer = null
        isCountingDown = false
        scanAudioEl?.pause()
        onComplete()
      }
    }, 1000)
  }

  function resetCountdown() {
    if (!countdownTimer) return
    clearInterval(countdownTimer)
    countdownTimer = null
    isCountingDown = false
    countdownEl.textContent = ''
    scanAudioEl?.pause()
  }

  return {
    async start(onComplete) {
      await cameraMotionService.ensureModelsLoaded()
      videoEl.srcObject = await cameraMotionService.getCameraStream()

      if (chromaCanvas && bgScanVideo) {
        chromaEffect = mountChromaKeyEffect(chromaCanvas, bgScanVideo)
        chromaEffect.start()
      }

      faceWatcher = cameraMotionService.watchFace(videoEl, (result) => {
        if (!result) {
          resetCountdown()
          wasSmiling = false
          return
        }

        const dims = faceapi.matchDimensions(overlayEl, videoEl, true)
        const resized = faceapi.resizeResults(result, dims)
        faceapi.draw.drawFaceExpressions(overlayEl, resized, 0.05)

        const isSmiling = result.expressions.happy > threshold
        if (isSmiling && !wasSmiling) startCountdown(onComplete)
        if (!isSmiling && wasSmiling) resetCountdown()
        wasSmiling = isSmiling
      })
    },
    destroy() {
      faceWatcher?.stop()
      resetCountdown()
      chromaEffect?.stop()
      container.innerHTML = ''
    },
  }
}
