// Transition types the timeline editor lets you attach between two scenes,
// and the CSS transform/opacity each one animates from/to. Applied to two
// stacked `.flow-layer` elements: the outgoing step animates through its
// "exit" state while the incoming step animates from "enter" to its
// resting state, at the same time, over `duration` ms.
const STATES = {
  fade: {
    enter: { opacity: '0' },
    active: { opacity: '1' },
    exit: { opacity: '0' },
  },
  'slide-left': {
    enter: { transform: 'translateX(100%)' },
    active: { transform: 'translateX(0)' },
    exit: { transform: 'translateX(-100%)' },
  },
  'slide-up': {
    enter: { transform: 'translateY(100%)' },
    active: { transform: 'translateY(0)' },
    exit: { transform: 'translateY(-100%)' },
  },
  zoom: {
    enter: { transform: 'scale(1.15)', opacity: '0' },
    active: { transform: 'scale(1)', opacity: '1' },
    exit: { transform: 'scale(0.9)', opacity: '0' },
  },
}

const DEFAULT_DURATION = 500

function applyState(el, type, state) {
  const props = STATES[type]?.[state]
  el.style.opacity = ''
  el.style.transform = ''
  if (props) Object.assign(el.style, props)
}

// Crossfades/slides `enterLayer` in over `exitLayer` and resolves once the
// animation has finished. A `type` of "none" (or missing) resolves
// immediately, leaving both layers exactly as the caller left them - this
// is what keeps existing flows without a `transition` config cutting
// instantly, same as before transitions existed.
export function runTransition({ type, duration = DEFAULT_DURATION } = {}, exitLayer, enterLayer) {
  if (!type || type === 'none' || !STATES[type] || !exitLayer) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    exitLayer.style.zIndex = '1'
    enterLayer.style.zIndex = '2'
    enterLayer.style.transition = 'none'
    exitLayer.style.transition = 'none'
    applyState(enterLayer, type, 'enter')

    // Force a layout flush so the "enter" starting state actually paints
    // before we switch to the transitioning end state on the next frame -
    // otherwise the browser can coalesce both style writes into one frame
    // and skip the animation entirely.
    void enterLayer.offsetHeight

    requestAnimationFrame(() => {
      const timing = `transform ${duration}ms ease, opacity ${duration}ms ease`
      enterLayer.style.transition = timing
      exitLayer.style.transition = timing
      applyState(enterLayer, type, 'active')
      applyState(exitLayer, type, 'exit')
    })

    setTimeout(() => {
      // Clear the stacking/transition styles this animation added so the
      // now-settled layer goes back to being an ordinary DOM-order-stacked
      // `.flow-layer` - otherwise a leftover z-index would sit above the
      // next step's layer and hide it.
      enterLayer.style.zIndex = ''
      enterLayer.style.transition = ''
      resolve()
    }, duration)
  })
}

export const TRANSITION_TYPES = Object.keys(STATES)
