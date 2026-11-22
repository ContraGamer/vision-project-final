const listeners = new Set()
export const errorBus = {
  emit: (message) => listeners.forEach((l) => l(message)),
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
}
export default errorBus
