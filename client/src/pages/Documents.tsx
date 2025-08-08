import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import ErrorBlock from '../components/ErrorBlock'

export default function Documents() {
  const { data, error, isLoading, isStale, dataUpdatedAt } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api<{ documents: { id: string; title: string; created: number }[] }>("/api/documents"),
    staleTime: 60_000,
  })

  return (
    <div>
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>Documents</h2>
        <Link to="/documents/new"><button type="button">New</button></Link>
      </div>
      <div className="row" style={{justifyContent:'space-between'}}>
        {isLoading ? <div className="muted">Loading…</div> : <div className="muted">Last updated {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'} {isStale && '(stale)'}</div>}
        <button type="button" onClick={() => window.location.reload()}>Refresh</button>
      </div>
      {error && <ErrorBlock error={error} />}
      <div className="list" style={{marginTop: '.5rem'}}>
        {data?.documents?.map((d) => (
          <div key={d.id} className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div><Link to={`/documents/${d.id}`}>{d.title}</Link></div>
                <div className="muted" style={{fontSize: '.9em'}}>Created {new Date((d.created||0)*1000).toLocaleString()}</div>
              </div>
              <Link to={`/documents/${d.id}`}><button type="button">Open</button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
