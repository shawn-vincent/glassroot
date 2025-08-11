import {
  ChatSection as ChatSectionUI,
} from '@llamaindex/chat-ui'

import '@llamaindex/chat-ui/styles/markdown.css'
import '@llamaindex/chat-ui/styles/pdf.css'
import '@llamaindex/chat-ui/styles/editor.css'
import { useOpenRouterChat } from '@/hooks/useOpenRouterChat'
import { CustomChatInput } from './CustomChatInput'
import { ChatMessage, type MessageRole, type AccentColor } from './ChatMessage'
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
  
  // Map message roles for our beautiful UI
  const mapMessageRole = (role: string): MessageRole => {
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
  
  // Apply accent class based on user selection
  const containerClasses = cn(
    'h-full flex flex-col transition-colors duration-300',
    {
      'accent-blue': userAccent === 'blue',
      'accent-green': userAccent === 'green',
      'accent-purple': userAccent === 'purple',
      'accent-orange': userAccent === 'orange',
      'accent-pink': userAccent === 'pink',
      'accent-teal': userAccent === 'teal',
      'accent-neutral': userAccent === 'neutral',
    }
  )
  
  
  return (
    <div className={containerClasses} style={{ backgroundColor: 'var(--bg)' }}>
    <ChatSectionUI handler={handler}>
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto scrollable-content py-4 space-y-2">
        {handler.messages.map((message, index) => {
          const role = mapMessageRole(message.role)
          const accent = getMessageAccent(message.role)
          const isLast = index === handler.messages.length - 1
          const isStreaming = isLast && handler.isLoading && message.role === 'assistant'
          
          return (
            <ChatMessage
              key={index}
              role={role}
              accent={accent}
              name={message.role === 'assistant' ? 'AI Assistant' : message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : undefined}
              time={new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
              isStreaming={isStreaming}
            >
              <MarkdownContent content={message.content} />
            </ChatMessage>
          )
        })}
        
        {/* Loading indicator with AI accent */}
        {handler.isLoading && handler.messages[handler.messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
            <div className={cn('flex gap-1 ml-3', {
              'accent-blue': aiAccent === 'blue',
              'accent-green': aiAccent === 'green',
              'accent-purple': aiAccent === 'purple',
              'accent-orange': aiAccent === 'orange',
              'accent-pink': aiAccent === 'pink',
              'accent-teal': aiAccent === 'teal',
              'accent-neutral': aiAccent === 'neutral',
            })}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              <div className="w-2 h-2 rounded-full animate-pulse delay-75" style={{ backgroundColor: 'var(--accent)' }} />
              <div className="w-2 h-2 rounded-full animate-pulse delay-150" style={{ backgroundColor: 'var(--accent)' }} />
            </div>
          </div>
        )}
      </div>
      
      {/* Input - inherits user accent from parent */}
      <div className={cn(
        "border-t border-[var(--border)] glass-subtle",
        userAccent && {
          'accent-blue': userAccent === 'blue',
          'accent-green': userAccent === 'green',
          'accent-purple': userAccent === 'purple',
          'accent-orange': userAccent === 'orange',
          'accent-pink': userAccent === 'pink',
          'accent-teal': userAccent === 'teal',
          'accent-neutral': userAccent === 'neutral',
        }
      )}>
        <CustomChatInput userAccent={userAccent} />
      </div>
    </ChatSectionUI>
    </div>
  )
}