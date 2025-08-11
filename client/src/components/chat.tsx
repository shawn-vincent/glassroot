import {
  ChatSection as ChatSectionUI,
} from '@llamaindex/chat-ui'

import '@llamaindex/chat-ui/styles/markdown.css'
import '@llamaindex/chat-ui/styles/pdf.css'
import '@llamaindex/chat-ui/styles/editor.css'
import { useOpenRouterChat } from '@/hooks/useOpenRouterChat'
import { CustomChatInput } from './CustomChatInput'
import { MermaidRenderer } from './MermaidRenderer'
import { ChatMessage, type MessageRole, type AccentColor } from './ChatMessage'
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
        {handler.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              Welcome to Glassroot Chat
            </h2>
            <p className="text-center max-w-md" style={{ color: 'var(--text-muted)' }}>
              Start a conversation with our AI assistant. Ask questions, get help with documents,
              or explore your knowledge base.
            </p>
          </div>
        ) : (
          handler.messages.map((message, index) => {
            const role = mapMessageRole(message.role)
            const accent = getMessageAccent(message.role)
            const isLast = index === handler.messages.length - 1
            const isStreaming = isLast && handler.isLoading && message.role === 'assistant'
            
            // Parse and render content with proper markdown support
            const renderContent = () => {
              // Check if content contains mermaid blocks
              const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
              const content = message.content
              const parts = []
              let lastIndex = 0
              let match
              
              while ((match = mermaidRegex.exec(content)) !== null) {
                // Add text before mermaid block
                if (match.index > lastIndex) {
                  parts.push(
                    <div key={`text-${lastIndex}`} className="prose-chat">
                      {content.slice(lastIndex, match.index)}
                    </div>
                  )
                }
                // Add mermaid block
                parts.push(
                  <MermaidRenderer key={`mermaid-${match.index}`} code={match[1]} />
                )
                lastIndex = match.index + match[0].length
              }
              
              // Add remaining text
              if (lastIndex < content.length) {
                parts.push(
                  <div key={`text-${lastIndex}`} className="prose-chat">
                    {content.slice(lastIndex)}
                  </div>
                )
              }
              
              return parts.length > 0 ? parts : <div className="prose-chat">{content}</div>
            }
            
            return (
              <ChatMessage
                key={index}
                role={role}
                accent={accent}
                name={message.role === 'assistant' ? 'AI Assistant' : message.role === 'user' ? 'You' : undefined}
                time={new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
                isStreaming={isStreaming}
              >
                {renderContent()}
              </ChatMessage>
            )
          })
        )}
        
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
      <div className="border-t border-[var(--border)] glass-subtle">
        <CustomChatInput />
      </div>
    </ChatSectionUI>
    </div>
  )
}