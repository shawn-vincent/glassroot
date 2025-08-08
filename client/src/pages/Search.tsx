import { useState } from 'react'
import { api } from '../lib/api'
import ErrorBlock from '../components/ErrorBlock'
import { Link } from 'react-router-dom'

export default function Search() {
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(10)
  const [results, setResults] = useState<Array<{id: string; title: string; similarity: number}>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{query: string; results: Array<{id: string; title: string; similarity: number}>}>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`)
      setResults(data.results)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Search</h2>
      <label htmlFor="search_query">Query</label>
      <input id="search_query" value={q} onChange={(e) => setQ(e.target.value)} style={{width:'100%'}} />
      <div className="row" style={{marginTop: '.5rem'}}>
        <label htmlFor="search_limit">Limit</label>
        <input id="search_limit" type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={{width:'6rem'}} />
        <button type="button" onClick={run} disabled={loading || !q.trim()}>Search</button>
      </div>
      {error ? <div style={{marginTop: '.75rem'}}><ErrorBlock error={error} /></div> : null}
      <div className="list" style={{marginTop: '.75rem'}}>
        {results.map(r => (
          <div key={r.id} className="card">
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                <div><Link to={`/documents/${r.id}`}>{r.title || r.id}</Link></div>
                <div className="muted">similarity: {r.similarity.toFixed(4)}</div>
              </div>
              <Link to={`/documents/${r.id}`}><button type="button">Open</button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
