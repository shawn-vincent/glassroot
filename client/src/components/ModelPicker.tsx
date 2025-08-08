import Select, { type StylesConfig } from 'react-select'
import { useEffect, useMemo, useState } from 'react'

type Option = { value: string; label: string }

async function fetchModels(): Promise<Option[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models')
    const data = await res.json()
    const models: Array<{ id: string; name?: string }> = data?.data || []
    return models.map((m) => ({ value: m.id, label: `${m.id}${m.name ? ` — ${m.name}` : ''}` }))
  } catch {
    return []
  }
}

export default function ModelPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const selected = useMemo(() => options.find(o => o.value === value) || (value ? { value, label: value } : null), [options, value])

  useEffect(() => {
    const cached = localStorage.getItem('openrouter_models')
    if (cached) {
      try { setOptions(JSON.parse(cached)) } catch {}
    }
    setLoading(true)
    fetchModels().then(opts => {
      if (opts.length) {
        setOptions(opts)
        localStorage.setItem('openrouter_models', JSON.stringify(opts))
      }
    }).finally(() => setLoading(false))
  }, [])

  const styles: StylesConfig<Option, false> = {
    control: (base) => ({ ...base, background: 'transparent', borderColor: '#3a3f46', color: 'var(--fg)' }),
    menu: (base) => ({ ...base, background: 'var(--bg)', color: 'var(--fg)' }),
    singleValue: (base) => ({ ...base, color: 'var(--fg)' }),
    input: (base) => ({ ...base, color: 'var(--fg)' }),
    option: (base, state) => ({ ...base, background: state.isFocused ? '#2b2f36' : 'transparent', color: 'var(--fg)' }),
  }

  return (
    <Select
      isClearable
      isSearchable
      isLoading={loading}
      options={options}
      value={selected}
      placeholder="Select a model…"
      onChange={(opt: Option | null) => onChange(opt?.value || '')}
      styles={styles}
    />
  )
}
