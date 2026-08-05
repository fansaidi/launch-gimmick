import { extractYouTubeId, loadYouTubeApi } from '../../services/youtube.js'

export const meta = {
  type: 'media.video',
  category: 'media',
  label: 'Video',
  description:
    'Plays a full-bleed video. Use for an intro/loading screen or a reward reveal. Accepts a direct video file URL or a YouTube link.',
  fields: [
    { key: 'src', label: 'Video URL (file or YouTube link)', type: 'text', required: true },
    { key: 'loop', label: 'Loop', type: 'boolean', default: false },
    { key: 'muted', label: 'Muted', type: 'boolean', default: true },
    { key: 'autoAdvance', label: 'Advance automatically when the video ends', type: 'boolean', default: true },
  ],
}

// Intro/reward step: plays a full-bleed video. Completes automatically when
// the video ends, or on tap when `autoAdvance` is false (e.g. a reward the
// user dismisses themselves).
export function render(container, config) {
  const { src, loop = false, autoAdvance = true, muted = true } = config
  const youTubeId = extractYouTubeId(src)

  return youTubeId
    ? renderYouTube(container, youTubeId, { loop, autoAdvance, muted })
    : renderFile(container, { src, loop, autoAdvance, muted })
}

function renderFile(container, { src, loop, autoAdvance, muted }) {
  container.innerHTML = `
    <div class="step step-media-video">
      <video class="media-video" src="${src}" ${loop ? 'loop' : ''} ${muted ? 'muted' : ''} autoplay playsinline></video>
    </div>
  `
  const video = container.querySelector('.media-video')

  return {
    start(onComplete) {
      video.play().catch(() => {})
      if (autoAdvance) {
        video.addEventListener('ended', onComplete, { once: true })
      } else {
        video.addEventListener('click', onComplete, { once: true })
      }
    },
    destroy() {
      video.pause()
      container.innerHTML = ''
    },
  }
}

function renderYouTube(container, videoId, { loop, autoAdvance, muted }) {
  const playerId = `yt-player-${Math.random().toString(36).slice(2)}`
  container.innerHTML = `
    <div class="step step-media-video">
      <div class="media-video">
        <div id="${playerId}"></div>
      </div>
      ${!autoAdvance ? '<div class="media-video-tap-catcher"></div>' : ''}
    </div>
  `
  const tapCatcher = container.querySelector('.media-video-tap-catcher')
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
