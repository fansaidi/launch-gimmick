function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const value = parseInt(clean, 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

// Composites a looping video onto a canvas with pixels near `keyColor`
// keyed out to transparent, so it can sit behind a live camera feed (or
// anything else). Matching is a simple distance-from-color check rather
// than a hue range, which keeps it simple to reason about at any color.
export function mountChromaKeyEffect(
  canvas,
  video,
  { width = window.screen.width, height = window.screen.height, keyColor = '#00ff00', tolerance = 90 } = {},
) {
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const { r: kr, g: kg, b: kb } = hexToRgb(keyColor)
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
      const dr = r - kr
      const dg = g - kg
      const db = b - kb
      if (Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance) {
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
