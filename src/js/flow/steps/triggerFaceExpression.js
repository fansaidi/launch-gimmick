import * as faceapi from 'face-api.js'
import { cameraMotionService } from '../../services/cameraMotionService.js'
import { mountChromaKeyEffect } from '../../services/chromaKeyEffect.js'

// All expressions face-api.js's expression model can classify.
export const FACE_EXPRESSIONS = ['happy', 'sad', 'angry', 'surprised', 'disgusted', 'fearful', 'neutral']

export const meta = {
  type: 'trigger.faceExpression',
  category: 'trigger',
  label: 'Face Expression',
  description: 'Waits for the viewer to hold a facial expression (smile, surprise, anger, ...) for a set duration.',
  fields: [
    { key: 'expression', label: 'Expression to detect', type: 'select', options: FACE_EXPRESSIONS, default: 'happy' },
    { key: 'threshold', label: 'Confidence threshold', type: 'number', min: 0, max: 1, step: 0.05, default: 0.75 },
    { key: 'holdMs', label: 'Hold duration (ms)', type: 'number', min: 500, step: 500, default: 3000 },
    { key: 'scanVideoSrc', label: 'Scanning overlay video (optional)', type: 'text' },
    { key: 'scanAudioSrc', label: 'Scanning sound (optional)', type: 'text' },
  ],
}

// Activation/action step: waits for the user to hold a chosen facial
// expression for `holdMs` before completing. Optionally overlays a looping
// "scanning" video (chroma keyed) and sound behind the live camera feed.
export function render(container, config) {
  const {
    expression = 'happy',
    threshold = 0.75,
    holdMs = 3000,
    scanVideoSrc,
    scanAudioSrc,
  } = config

  if (!FACE_EXPRESSIONS.includes(expression)) {
    throw new Error(`Unknown expression "${expression}". Expected one of: ${FACE_EXPRESSIONS.join(', ')}`)
  }

  container.innerHTML = `
    <div class="step step-trigger-face-expression video-container">
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
  let isTriggering = false

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
          isTriggering = false
          return
        }

        const dims = faceapi.matchDimensions(overlayEl, videoEl, true)
        const resized = faceapi.resizeResults(result, dims)
        faceapi.draw.drawFaceExpressions(overlayEl, resized, 0.05)

        const matched = result.expressions[expression] > threshold
        if (matched && !isTriggering) startCountdown(onComplete)
        if (!matched && isTriggering) resetCountdown()
        isTriggering = matched
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
