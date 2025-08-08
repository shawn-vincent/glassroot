import { Thread } from '../components/Thread'
import { ChatProvider } from '../components/ChatProvider'
import ErrorBlock from '../components/ErrorBlock'
import { useState, useEffect } from 'react'
import { useAssistantRuntime } from '@assistant-ui/react'

function ChatWithErrorHandling() {
  const [error, setError] = useState<unknown>(null)
  const model = localStorage.getItem('openrouter_model') || ''
  const key = localStorage.getItem('openrouter_api_key') || ''
  const disabled = !model || !key

  if (disabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Configuration Required</h3>
        <p className="text-muted-foreground mb-4">
          Please configure your OpenRouter model and API key to start chatting.
        </p>
        <p className="text-sm text-muted-foreground">
          Click the Config button in the top-right corner to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Thread className="flex-1" />
      {error ? (
        <div className="p-4 border-t">
          <ErrorBlock error={error} />
        </div>
      ) : null}
    </div>
  )
}

export default function Home() {
  return (
    <ChatProvider>
      <ChatWithErrorHandling />
    </ChatProvider>
  )
}
