// Runs an ordered list of steps (activation gestures, intro/loading media,
// action gestures, reward media, ...) one at a time. Each step type is
// resolved from the registry, mounted into `container`, and is responsible
// for calling onComplete() when its own exit condition is met, at which
// point the engine tears it down and advances to the next step.
export class FlowEngine {
  constructor(flow, container, { stepRegistry } = {}) {
    if (!stepRegistry) throw new Error('FlowEngine requires a stepRegistry')

    this.flow = flow
    this.container = container
    this.stepRegistry = stepRegistry
    this.index = -1
    this.activeStep = null
  }

  start() {
    return this.goTo(0)
  }

  async goTo(index) {
    if (index >= this.flow.steps.length) {
      this.activeStep = null
      this.flow.onComplete?.(this)
      return
    }

    if (this.activeStep) {
      this.activeStep.destroy?.()
      this.activeStep = null
    }

    const stepDef = this.flow.steps[index]
    const stepModule = this.stepRegistry.get(stepDef.type)
    if (!stepModule) {
      throw new Error(`Unknown step type: "${stepDef.type}"`)
    }

    this.index = index
    this.activeStep = stepModule.render(this.container, stepDef.config ?? {}, this.buildContext())
    await this.activeStep.start(() => this.advance())
  }

  advance() {
    this.goTo(this.index + 1)
  }

  buildContext() {
    return { flow: this.flow, engine: this }
  }
}
