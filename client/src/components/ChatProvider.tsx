import { useState, useCallback } from 'react'
import { AssistantRuntimeProvider, useExternalStoreRuntime, type ThreadMessageLike, type AppendMessage } from '@assistant-ui/react'

type ChatProviderProps = {
  children: React.ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ThreadMessageLike[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const handleNewMessage = useCallback(async (message: AppendMessage) => {
    const model = localStorage.getItem('openrouter_model') || ''
    const key = localStorage.getItem('openrouter_api_key') || ''
    const systemPrompt = localStorage.getItem('llm_prompt') || ''

    if (!model || !key) {
      throw new Error('OpenRouter model and API key must be configured')
    }

    // Add user message immediately
    const userMessage: ThreadMessageLike = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.content,
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsRunning(true)

    // Create assistant message placeholder for streaming
    const assistantId = crypto.randomUUID()
    const assistantMessage: ThreadMessageLike = {
      id: assistantId,
      role: 'assistant',
      content: [{ type: 'text', text: '' }],
      createdAt: new Date(),
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role,
              content: typeof m.content === 'string' ? m.content : 
                Array.isArray(m.content) ? 
                  m.content.map(c => c.type === 'text' ? c.text : '').join('') :
                  ''
            })),
            { role: 'user', content: typeof message.content === 'string' ? message.content :
              Array.isArray(message.content) ?
                message.content.map(c => c.type === 'text' ? c.text : '').join('') :
                ''
            },
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenRouter API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta) {
                  fullText += delta
                  setMessages(prev => prev.map(m => 
                    m.id === assistantId ? {
                      ...m,
                      content: [{ type: 'text', text: fullText }]
                    } : m
                  ))
                }
              } catch (e) {
                // Skip invalid JSON chunks
                console.warn('Failed to parse chunk:', data)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      console.error('Chat error:', error)
      // Remove the assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId))
      throw error
    } finally {
      setIsRunning(false)
    }
  }, [messages])

  const runtime = useExternalStoreRuntime({
    messages,
    setMessages,
    isRunning,
    onNew: handleNewMessage,
    convertMessage: (message) => {
      if (typeof message.content === 'string') {
        return {
          ...message,
          content: [{ type: 'text', text: message.content }]
        }
      }
      return message
    },
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}