// YouTube doesn't expose a raw playable file URL - youtube.com/watch and
// youtu.be links are pages, not media - so a plain <video src> can't play
// them. Playback has to go through YouTube's IFrame Player API instead.

export function extractYouTubeId(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

let apiPromise = null

// Lazy-loads the IFrame API script once and caches the promise, same
// pattern as cameraMotionService's model loading.
export function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return apiPromise
}
