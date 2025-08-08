type Listener = (msg: string) => void

const listeners = new Set<Listener>()

export function onError(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function pushError(error: unknown) {
  let message = 'Unknown error'
  if (typeof error === 'string') message = error
  else if (error && typeof error === 'object') {
    const rec = error as Record<string, unknown>
    const res = (rec.response as Record<string, unknown>) || {}
    const data = ((res?.data as unknown) ?? (rec as Record<string, unknown>).data ?? rec) as Record<string, unknown>
    message = typeof data.error === 'string' ? data.error : (typeof data.message === 'string' ? data.message : String(error))
  } else if (error instanceof Error) message = error.message
  for (const l of listeners) l(message)
}
