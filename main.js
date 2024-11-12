// Import statements
import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import * as faceapi from 'face-api.js'
import $ from "jquery";
import {
  TINY_FACE_DETECTOR,
  isFaceDetectionModelLoaded,
  getFaceDetectorOptions,
  changeInputSize,
  initFaceDetectionControls,
  changeFaceDetector,
} from './src/js/faceDetectionControls.js'
import { processor } from './src/js/processor.js'

// Variable declarations
let forwardTimes = []
let withBoxes = false
let countdown = null; // Countdown interval
let countdownValue = 3; // Countdown start value
let isCountingDown = false; // Countdown state
let wasSmiling = false; // Tracks previous smiling state

// Functions
export function onChangeHideBoundingBoxes(e) {
  withBoxes = !$(e.target).prop('checked')
}

function updateTimeStats(timeInMs) {
  forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
  const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
  $('#time').val(`${Math.round(avgTimeInMs)} ms`)
  $('#fps').val(`${faceapi.utils.round(1000 / avgTimeInMs)}`)
}

export async function onPlay() {
  const videoEl = $('#inputVideo').get(0)

  if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
    return setTimeout(() => onPlay())

  const options = getFaceDetectorOptions()
  const ts = Date.now()

  const result = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions()

  updateTimeStats(Date.now() - ts)

  if (result) {
    const canvas = $('#overlay').get(0)
    const dims = faceapi.matchDimensions(canvas, videoEl, true)
    const resizedResult = faceapi.resizeResults(result, dims)
    const minConfidence = 0.05

    if (withBoxes) {
      faceapi.draw.drawDetections(canvas, resizedResult)
    }
    faceapi.draw.drawFaceExpressions(canvas, resizedResult, minConfidence)

    // Check for smile
    const expressions = result.expressions;
    const isSmiling = expressions.happy > 0.75; // Confidence threshold for smile

    if (isSmiling) {
      if (!wasSmiling) { // If it just switched to "smiling"
        startCountdown();
      }
      wasSmiling = true;
    } else {
      if (wasSmiling) { // If it just stopped smiling
        resetCountdown();
      }
      wasSmiling = false;
    }
  } else {
    resetCountdown(); // Reset if no face detected
    wasSmiling = false;
  }

  setTimeout(() => onPlay())
}

export async function run() {
  await changeFaceDetector(TINY_FACE_DETECTOR)
  await faceapi.loadFaceExpressionModel('./models')
  changeInputSize(416)

  const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
  const videoEl = $('#inputVideo').get(0)
  videoEl.srcObject = stream
}


function startCountdown() {
  if (isCountingDown) return; // Avoid multiple countdowns

  isCountingDown = true;
  countdownValue = 3; // Reset countdown value
  $('#countdownDisplay').text(countdownValue); // Display initial value
  $('#scanAudio').get(0).play();

  countdown = setInterval(() => {
    countdownValue -= 1;
    $('#countdownDisplay').text(countdownValue); // Update display

    if (countdownValue <= 0) {
      clearInterval(countdown);
      isCountingDown = false;

      $('.video-container').hide();
      resetScanAudio();
      $('#montage').get(0).play();
    }
  }, 1000);
}

function resetCountdown() {
  if (countdown) {
    clearInterval(countdown);
    isCountingDown = false;
    countdownValue = 5; // Reset countdown value
    $('#countdownDisplay').text(""); // Clear display
    resetScanAudio();

  }
}

function resetScanAudio() {
  $('#scanAudio').get(0).pause();
  // $('#scanAudio').get(0).fastSeek(0);
}
// jQuery initialization
$(function () {
  initFaceDetectionControls()
  run()
  processor.doLoad()

  // Attach the onPlay event listener
  const videoEl = $('#inputVideo')
  videoEl.on('play', () => onPlay())
})
