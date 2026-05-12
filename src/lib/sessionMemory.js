const KEY = 'icu_shared_session_memory'

export function getSessionMemory() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function updateSessionMemory(partial) {
  const current = getSessionMemory()
  const next = { ...current, ...partial, updatedAt: new Date().toISOString() }
  sessionStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function seedFromMemory(currentData = {}) {
  const memory = getSessionMemory()
  return { ...memory, ...currentData }
}
