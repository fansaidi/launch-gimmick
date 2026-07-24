const registry = new Map()

export const stepRegistry = {
  register(type, stepModule) {
    registry.set(type, stepModule)
  },
  get(type) {
    return registry.get(type)
  },
  // All registered components' metadata, for a "pick a component" UI.
  list() {
    return Array.from(registry.values(), (stepModule) => stepModule.meta).filter(Boolean)
  },
}
