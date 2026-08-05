import { extractYouTubeId, loadYouTubeApi } from '../../services/youtube.js'

export const meta = {
  type: 'media.embed',
  category: 'media',
  label: 'Video Embed',
  description:
    "Embeds a video from YouTube using YouTube's own player. For a direct video file (e.g. an uploaded mp4), use Video instead.",
  fields: [
    { key: 'src', label: 'YouTube URL', type: 'text', required: true },
    { key: 'loop', label: 'Loop', type: 'boolean', default: false },
    { key: 'muted', label: 'Muted', type: 'boolean', default: true },
    { key: 'autoAdvance', label: 'Advance automatically when the video ends', type: 'boolean', default: true },
  ],
}

// Intro/reward step: embeds a YouTube video through YouTube's IFrame
// Player API (a plain <video src> can't play a youtube.com/watch or
// youtu.be link - those are page URLs, not a playable file).
export function render(container, config) {
  const { src, loop = false, autoAdvance = true, muted = true } = config
  const videoId = extractYouTubeId(src)

  if (!videoId) {
    container.innerHTML = `
      <div class="step step-media-embed">
        <div class="media-embed-error">Couldn't recognize this as a YouTube link.</div>
      </div>
    `
    return {
      start() {},
      destroy() {
        container.innerHTML = ''
      },
    }
  }

  const playerId = `yt-player-${Math.random().toString(36).slice(2)}`
  container.innerHTML = `
    <div class="step step-media-embed">
      <div class="media-embed">
        <div id="${playerId}"></div>
      </div>
      ${!autoAdvance ? '<div class="media-embed-tap-catcher"></div>' : ''}
    </div>
  `
  const tapCatcher = container.querySelector('.media-embed-tap-catcher')
  let player = null

  return {
    async start(onComplete) {
      if (!autoAdvance) {
        tapCatcher.addEventListener('click', onComplete, { once: true })
      }

      const YT = await loadYouTubeApi()
      player = new YT.Player(playerId, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: muted ? 1 : 0,
          playsinline: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          ...(loop ? { loop: 1, playlist: videoId } : {}),
        },
        events: {
          onStateChange(event) {
            if (autoAdvance && event.data === YT.PlayerState.ENDED) onComplete()
          },
        },
      })
    },
    destroy() {
      player?.destroy?.()
      container.innerHTML = ''
    },
  }
}
