import { useState } from 'react'
import { z } from 'zod'
import { api } from '../lib/api'
import ErrorBlock from '../components/ErrorBlock'
import { useNavigate } from 'react-router-dom'

const Schema = z.object({ title: z.string().trim().min(1), content: z.string().trim().min(1) })

export default function DocumentNew() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function create() {
    setError(null)
    const parsed = Schema.safeParse({ title, content })
    if (!parsed.success) { setError(parsed.error); return }
    setLoading(true)
    try {
      const res = await api<{ id: string; title: string; content: string }>("/api/documents", {
        method: 'POST',
        body: JSON.stringify(parsed.data)
      })
      nav(`/documents/${res.id}`)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>New Document</h2>
      <label htmlFor="doc_title">Title</label>
      <input id="doc_title" value={title} onChange={(e) => setTitle(e.target.value)} style={{width:'100%'}} />
      <label htmlFor="doc_content">Content</label>
      <textarea id="doc_content" rows={12} value={content} onChange={(e) => setContent(e.target.value)} style={{width:'100%'}} />
      <div className="row" style={{marginTop: '.75rem'}}>
        <button type="button" disabled={loading} onClick={create}>Create</button>
      </div>
      {error ? <div style={{marginTop: '.75rem'}}><ErrorBlock error={error} /></div> : null}
    </div>
  )
}
