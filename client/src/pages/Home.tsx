import { useState } from 'react'
import ErrorBlock from '../components/ErrorBlock'
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRef } from 'react'

export default function Home() {
  const inputRef = useRef<any>(null)
  const [model, setModel] = useState(() => localStorage.getItem('openrouter_model') || '')
  const [key, setKey] = useState(() => localStorage.getItem('openrouter_api_key') || '')
  const [system, setSystem] = useState(() => localStorage.getItem('llm_prompt') || '')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>>([])
  const [error, setError] = useState<unknown>(null)
  const disabled = !model || !key
  const tokenWarn = input.length > 16000
  const [sending, setSending] = useState(false)

  async function send(text: string) {
    setError(null)
    const newMsg = { role: 'user' as const, content: text }
    setMessages((m) => [...m, newMsg])
    setSending(true)
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': location.origin,
          'X-Title': 'Glassroot',
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            ...messages.filter(m => m.role !== 'system'),
            newMsg,
          ]
        })
      })
      const data = await res.json()
      if (!res.ok) throw { response: { status: res.status, data } }
      const content = data.choices?.[0]?.message?.content || ''
      setMessages((m) => [...m, { role: 'assistant', content }])
    } catch (e) {
      setError(e)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <MainContainer style={{ height: '100%' }}>
          <ChatContainer style={{ height: '100%' }}>
            <MessageList typingIndicator={sending ? <TypingIndicator content="Thinking…" /> : undefined}>
              {messages.filter(m => m.role !== 'system').map((m, i) => (
                <Message
                  key={`${m.role}-${i}-${m.content.slice(0,10)}`}
                  model={{
                    message: '',
                    sentTime: undefined,
                    sender: m.role === 'user' ? 'You' : 'Assistant',
                    direction: m.role === 'user' ? 'outgoing' : 'incoming',
                    position: 'single',
                  }}
                >
                  <Message.CustomContent>
                    <div className="markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </Message.CustomContent>
                </Message>
              ))}
            </MessageList>
            <MessageInput
              placeholder="Type message here"
              value={input}
              onChange={val => setInput(val)}
              onSend={val => { if (!disabled && val.trim()) { void send(val); setInput(''); setTimeout(() => inputRef.current?.focus?.(), 0) } }}
              disabled={disabled || sending}
              ref={inputRef}
              autoFocus
            />
          </ChatContainer>
        </MainContainer>
      </div>
      {error ? <div style={{marginTop: '.5rem'}}><ErrorBlock error={error} /></div> : null}
    </div>
  )
}
