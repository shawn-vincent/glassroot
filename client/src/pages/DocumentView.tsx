import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import ErrorBlock from '../components/ErrorBlock'

type DocRow = { id: string; title: string; content: string; vector_id: string; created: number }

export default function DocumentView() {
  const { id = '' } = useParams()
  const { data, isLoading, error } = useQuery<DocRow>({
    queryKey: ['document', id],
    queryFn: () => api<DocRow>(`/api/documents/${id}`),
  })
  return (
    <div>
      {isLoading && <div className="muted">Loading…</div>}
      {error && <ErrorBlock error={error} />}
      {data && (
        <div>
          <h2>{data.title}</h2>
          <div className="muted">Created {new Date((data.created||0)*1000).toLocaleString()}</div>
          <div className="card" style={{whiteSpace:'pre-wrap', marginTop: '.75rem'}}>{data.content}</div>
        </div>
      )}
    </div>
  )
}
