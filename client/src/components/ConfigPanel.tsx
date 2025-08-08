import { useEffect, useState } from 'react'
import PromptEditor from './PromptEditor'
import ModelPicker from './ModelPicker'
import { X, Eye, EyeOff } from 'lucide-react'

type Props = { onClose: () => void }

export default function ConfigPanel({ onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    setApiKey(localStorage.getItem('openrouter_api_key') || '')
    setModel(localStorage.getItem('openrouter_model') || '')
    setPrompt(localStorage.getItem('llm_prompt') || '')
  }, [])

  function save() {
    localStorage.setItem('openrouter_api_key', apiKey.trim())
    localStorage.setItem('openrouter_model', model.trim())
    localStorage.setItem('llm_prompt', prompt)
    onClose()
  }

  function onSheetKey(e: React.KeyboardEvent<HTMLDialogElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div className="sheet">
      <dialog open className="panel" onKeyDown={onSheetKey}>
        <header>
          <h3>Configuration</h3>
          <button type="button" onClick={onClose} className="icon-button">
            <X size={18} />
            Close
          </button>
        </header>
        <div className="grid" style={{marginTop: '.5rem'}}>
          <div>
            <label htmlFor="cfg_api_key">OpenRouter API Key</label>
            <div className="row">
              <input id="cfg_api_key" type={show ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-or-..." style={{width:'100%'}} />
              <button type="button" onClick={() => setShow(s => !s)} className="icon-button">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <label htmlFor="cfg_model">Model</label>
            <div id="cfg_model">
              <ModelPicker value={model} onChange={setModel} />
            </div>
          </div>
          <div>
            <label htmlFor="cfg_prompt">System Prompt (Markdown)</label>
            <div id="cfg_prompt">
              <PromptEditor value={prompt} onChange={setPrompt} />
            </div>
          </div>
        </div>
        <div className="row" style={{marginTop: '.75rem', justifyContent:'flex-end'}}>
          <button type="button" onClick={save}>Save</button>
        </div>
      </dialog>
    </div>
  )
}
