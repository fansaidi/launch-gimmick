import * as faceapi from 'face-api.js'
import {
  TINY_FACE_DETECTOR,
  isFaceDetectionModelLoaded,
  getFaceDetectorOptions,
  changeInputSize,
  changeFaceDetector,
} from '../faceDetectionControls.js'

// Shared camera/model state so multiple steps in a flow (e.g. an activation
// gesture step followed later by an action gesture step) can reuse the same
// webcam stream and loaded models instead of re-requesting them.
let modelsReadyPromise = null
let sharedStreamPromise = null

function ensureModelsLoaded() {
  if (!modelsReadyPromise) {
    modelsReadyPromise = (async () => {
      await changeFaceDetector(TINY_FACE_DETECTOR)
      await faceapi.loadFaceExpressionModel('./models')
      changeInputSize(416)
    })()
  }
  return modelsReadyPromise
}

function getCameraStream() {
  if (!sharedStreamPromise) {
    sharedStreamPromise = navigator.mediaDevices.getUserMedia({ video: {} })
  }
  return sharedStreamPromise
}

// Runs a face + expression detection loop against a <video> element and
// calls onResult with the face-api result (or null when no face is found)
// on every frame. Returns a handle to stop the loop.
function watchFace(videoEl, onResult) {
  let stopped = false

  async function tick() {
    if (stopped) return
    if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()) {
      setTimeout(tick, 50)
      return
    }

    const options = getFaceDetectorOptions()
    const result = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions()
    if (!stopped) onResult(result)
    setTimeout(tick)
  }
  tick()

  return { stop: () => { stopped = true } }
}

export const cameraMotionService = {
  ensureModelsLoaded,
  getCameraStream,
  watchFace,
}
