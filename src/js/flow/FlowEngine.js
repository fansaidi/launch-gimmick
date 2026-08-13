import { runTransition } from './transitions.js'
import { mountStepOverlay } from './stepOverlay.js'

// Runs an ordered list of steps (activation gestures, intro/loading media,
// action gestures, reward media, ...) one at a time. Each step type is
// resolved from the registry, mounted into its own layer inside
// `container`, and is responsible for calling onComplete() when its own
// exit condition is met, at which point the engine advances to the next
// step - crossfading/sliding into it first if that step has a `transition`
// configured. A step can also carry an `overlay` (see stepOverlay.js) that
// plays behind its content for as long as it's active.
export class FlowEngine {
  constructor(flow, container, { stepRegistry } = {}) {
    if (!stepRegistry) throw new Error('FlowEngine requires a stepRegistry')

    this.flow = flow
    this.container = container
    this.stepRegistry = stepRegistry
    this.index = -1
    this.activeStep = null
    this.activeLayer = null
    this.activeOverlay = null
  }

  start() {
    return this.goTo(0)
  }

  async goTo(index) {
    if (index >= this.flow.steps.length) {
      // Deliberately leaves the last step's content on screen (e.g. a
      // reward video the viewer stays on) rather than tearing it down.
      this.activeStep = null
      this.flow.onComplete?.(this)
      return
    }

    const stepDef = this.flow.steps[index]
    const stepModule = this.stepRegistry.get(stepDef.type)
    if (!stepModule) {
      throw new Error(`Unknown step type: "${stepDef.type}"`)
    }

    const previousStep = this.activeStep
    const previousLayer = this.activeLayer
    const previousOverlay = this.activeOverlay

    const layer = document.createElement('div')
    layer.className = 'flow-layer'
    this.container.appendChild(layer)

    this.index = index
    this.activeLayer = layer
    this.activeStep = stepModule.render(layer, stepDef.config ?? {}, this.buildContext())
    this.activeOverlay = mountStepOverlay(layer, stepDef.overlay)

    // The very first step has nothing to transition from - it just appears.
    if (previousLayer) {
      await runTransition(stepDef.transition, previousLayer, layer)
      previousOverlay?.stop()
      previousStep?.destroy?.()
      previousLayer.remove()
    }

    await this.activeStep.start(() => this.advance())
  }

  advance() {
    this.goTo(this.index + 1)
  }

  buildContext() {
    return { flow: this.flow, engine: this }
  }
}
