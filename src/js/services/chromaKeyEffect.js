// Composites a looping "scan" video onto a canvas with greenish pixels
// keyed out to transparent, so it can sit behind a live camera feed.
export function mountChromaKeyEffect(canvas, video, { width = window.screen.width, height = window.screen.height } = {}) {
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  let timer = null
  let running = false

  function computeFrame() {
    ctx.drawImage(video, 0, 0, width, height)
    const frame = ctx.getImageData(0, 0, width, height)
    const len = frame.data.length / 4

    for (let i = 0; i < len; i++) {
      const r = frame.data[i * 4]
      const g = frame.data[i * 4 + 1]
      const b = frame.data[i * 4 + 2]
      if (r >= 30 && r <= 200 && g >= 140 && g <= 255 && b <= 120) {
        frame.data[i * 4 + 3] = 0
      }
    }
    ctx.putImageData(frame, 0, 0)
  }

  function loop() {
    if (!running || video.paused || video.ended) return
    computeFrame()
    timer = setTimeout(loop, 0)
  }

  function start() {
    running = true
    if (video.readyState >= 2) loop()
    else video.addEventListener('canplay', loop, { once: true })
  }

  function stop() {
    running = false
    clearTimeout(timer)
  }

  return { start, stop }
}
