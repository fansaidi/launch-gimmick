import * as faceapi from 'face-api.js'
import { cameraMotionService } from '../../services/cameraMotionService.js'

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
  ],
}

// Activation/action step: waits for the user to hold a chosen facial
// expression for `holdMs` before completing. The "build anticipation"
// scanning video/sound this used to render itself is now a generic
// per-step overlay any step can have - see stepOverlay.js and FlowEngine.
export function render(container, config) {
  const { expression = 'happy', threshold = 0.75, holdMs = 3000 } = config

  if (!FACE_EXPRESSIONS.includes(expression)) {
    throw new Error(`Unknown expression "${expression}". Expected one of: ${FACE_EXPRESSIONS.join(', ')}`)
  }

  container.innerHTML = `
    <div class="step step-trigger-face-expression video-container">
      <div class="cam-container">
        <div class="countdown-display"></div>
        <video class="input-video" autoplay muted playsinline></video>
        <canvas class="overlay"></canvas>
      </div>
    </div>
  `

  const videoEl = container.querySelector('.input-video')
  const overlayEl = container.querySelector('.overlay')
  const countdownEl = container.querySelector('.countdown-display')

  let countdownTimer = null
  let isCountingDown = false
  let faceWatcher = null
  let isTriggering = false

  function startCountdown(onComplete) {
    if (isCountingDown) return
    isCountingDown = true
    let secondsLeft = Math.round(holdMs / 1000)
    countdownEl.textContent = secondsLeft

    countdownTimer = setInterval(() => {
      secondsLeft -= 1
      countdownEl.textContent = secondsLeft
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer)
        countdownTimer = null
        isCountingDown = false
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
  }

  return {
    async start(onComplete) {
      await cameraMotionService.ensureModelsLoaded()
      videoEl.srcObject = await cameraMotionService.getCameraStream()

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
      container.innerHTML = ''
    },
  }
}
