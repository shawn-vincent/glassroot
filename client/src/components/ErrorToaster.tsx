import { useEffect, useState } from 'react'
import { onError } from '../lib/errors'

export default function ErrorToaster() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let timer: number | undefined
    const off = onError((m) => {
      setMsg(m)
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setMsg(null), 6000)
    })
    return () => { off(); if (timer) window.clearTimeout(timer) }
  }, [])
  if (!msg) return null
  return (
    <div style={{position:'fixed', right: 12, bottom: 12, maxWidth: 420, zIndex: 50}}>
      <div className="card" style={{ background: '#ff6b6b10', borderColor: '#ff6b6b55'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12}}>
          <div><strong>Error:</strong> {msg}</div>
          <button type="button" onClick={() => setMsg(null)}>Dismiss</button>
        </div>
      </div>
    </div>
  )
}
