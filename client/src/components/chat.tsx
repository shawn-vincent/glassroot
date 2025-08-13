import { ChatSection as ChatSectionProvider } from '@llamaindex/chat-ui'
import '@llamaindex/chat-ui/styles/markdown.css'
import '@llamaindex/chat-ui/styles/pdf.css'
import '@llamaindex/chat-ui/styles/editor.css'
import { useOpenRouterChat } from '@/hooks/useOpenRouterChat'
import { CustomChatInput } from './CustomChatInput'
import { ChatMessage, type MessageRole } from './ChatMessage'
import type { AccentColor } from '@/lib/theme-colors'
import { MarkdownContent } from './MarkdownContent'
import { useEffect, useState } from 'react' 
import { cn } from '@/lib/utils' 

export function ChatSection() {
  const handler = useOpenRouterChat()
  const [userAccent, setUserAccent] = useState<AccentColor>('blue')
  const [aiAccent, setAiAccent] = useState<AccentColor>('purple')
  
  
  // Load accent colors from localStorage
  useEffect(() => {
    const savedUserAccent = localStorage.getItem('user_accent_color') as AccentColor
    const savedAiAccent = localStorage.getItem('ai_accent_color') as AccentColor
    if (savedUserAccent) setUserAccent(savedUserAccent)
    if (savedAiAccent) setAiAccent(savedAiAccent)
  }, [])
  
  // Autoscroll intentionally removed for a fresh start
  
  // Map message roles for our beautiful UI
  const mapMessageRole = (role: string, status?: string): MessageRole => {
    if (status === 'failed') {
      return 'error'
    }
    switch (role) {
      case 'user':
        return 'self'
      case 'assistant':
        return 'assistant'
      case 'system':
        return 'system'
      case 'tool':
        return 'tool'
      default:
        return 'assistant'
    }
  }
  
  // Get accent color for message
  const getMessageAccent = (role: string): AccentColor | undefined => {
    if (role === 'user') return userAccent
    if (role === 'assistant') return aiAccent
    return undefined
  }

  // Retry failed message
  const handleRetry = (messageIndex: number) => {
    // Find the last user message before this failed message
    let lastUserMessageIndex = -1
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (handler.messages[i].role === 'user') {
        lastUserMessageIndex = i
        break
      }
    }
    
    if (lastUserMessageIndex !== -1) {
      // Remove all messages from the failed message onward
      const newMessages = handler.messages.slice(0, messageIndex)
      handler.setMessages(newMessages)
      
      // Resend the last user message
      const lastUserMessage = handler.messages[lastUserMessageIndex]
      handler.append(lastUserMessage)
    }
  }
  
  // No need for accent classes - they're applied globally now
  const containerClasses = 'h-full flex flex-col transition-colors duration-300'
  
  
  return (
    <div className={containerClasses} style={{ backgroundColor: 'var(--bg)' }}>
    <ChatSectionProvider handler={handler}>
      {/* Custom layout with no gap */}
      <div className="flex h-full w-full flex-col">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto scrollable-content px-4 py-4 space-y-2">
        {handler.messages.map((message, index) => {
          const role = mapMessageRole(message.role, message.status)
          const accent = getMessageAccent(message.role)
          const isLast = index === handler.messages.length - 1
          const isStreaming = isLast && handler.isLoading && message.role === 'assistant'
          const isFailed = message.status === 'failed'
          
          return (
            <ChatMessage
              key={`msg-${index}-${message.role}-${message.content.substring(0, 20)}`}
              role={role}
              accent={accent}
              name={message.role === 'assistant' ? 'AI Assistant' : message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : undefined}
              time={new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
              isStreaming={isStreaming}
              onRetry={isFailed ? () => handleRetry(index) : undefined}
            >
              <MarkdownContent content={message.content} />
            </ChatMessage>
          )
        })}
        
        {/* Loading indicator - uses AI's accent color */}
        {handler.isLoading && handler.messages[handler.messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
            <div className="flex gap-1 ml-3">
              <div 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: `var(--color-${aiAccent}-500)` }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-pulse delay-75" 
                style={{ backgroundColor: `var(--color-${aiAccent}-500)` }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-pulse delay-150" 
                style={{ backgroundColor: `var(--color-${aiAccent}-500)` }}
              />
            </div>
          </div>
        )}

        {/* Autoscroll and jump button removed */}
      </div>
      
      {/* Input - uses global accent color */}
      <div className="border-t border-[var(--border)] glass-subtle">
        <CustomChatInput userAccent={userAccent} />
      </div>
    </div>
    </ChatSectionProvider>
    </div>
  )
}
