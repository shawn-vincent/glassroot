type ErrorPayload = {
  message: string
  status?: number
  timestamp?: string
  correlationId?: string
  raw?: unknown
}

type Props = { error: unknown }

export default function ErrorBlock({ error }: Props) {
  if (!error) return null
  const data = normalizeError(error)
  return (
    <div className="error">
      <div><strong>Error:</strong> {data.message}</div>
      {data.status && <div className="muted">Status: {data.status}</div>}
      {data.timestamp && <div className="muted">Time: {data.timestamp}</div>}
      {data.correlationId && <div className="muted">Correlation ID: {data.correlationId}</div>}
      <div style={{marginTop: '.5rem'}}>
        <button type="button" onClick={() => copyDetails(data)}>Copy details</button>
      </div>
    </div>
  )
}

function hasKey<T extends string>(obj: unknown, key: T): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && key in (obj as Record<string, unknown>)
}

function normalizeError(e: unknown): ErrorPayload {
  let payload: unknown = e
  const response = hasKey(e, 'response') ? (e as Record<'response', unknown>).response : undefined
  if (response && hasKey(response, 'data')) payload = (response as Record<'data', unknown>).data
  else if (hasKey(e, 'data')) payload = (e as Record<'data', unknown>).data
  if (payload && typeof payload === 'object') {
    const rec = payload as Record<string, unknown>
    return {
      message: typeof rec.error === 'string' ? rec.error : (typeof rec.message === 'string' ? rec.message : 'Unknown error'),
      status: typeof rec.status === 'number' ? rec.status : undefined,
      timestamp: typeof rec.timestamp === 'string' ? rec.timestamp : undefined,
      correlationId: typeof rec.correlationId === 'string' ? rec.correlationId : undefined,
      raw: payload,
    }
  }
  return { message: String(e), raw: e }
}

function copyDetails(d: ErrorPayload) {
  const redacted = redact(JSON.stringify({
    message: d.message,
    status: d.status,
    timestamp: d.timestamp,
    correlationId: d.correlationId
  }, null, 2))
  navigator.clipboard.writeText(redacted)
}

function redact(s: string) {
  return s.replace(/[A-Za-z0-9_\-]{20,}/g, '•••redacted•••')
}
