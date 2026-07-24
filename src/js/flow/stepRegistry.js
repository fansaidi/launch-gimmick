const registry = new Map()

export const stepRegistry = {
  register(type, stepModule) {
    registry.set(type, stepModule)
  },
  get(type) {
    return registry.get(type)
  },
}
