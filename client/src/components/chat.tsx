import {
  ChatSection as ChatSectionUI,
  ChatMessages,
  ChatMessage,
} from '@llamaindex/chat-ui'

import '@llamaindex/chat-ui/styles/markdown.css'
import '@llamaindex/chat-ui/styles/pdf.css'
import '@llamaindex/chat-ui/styles/editor.css'
import { useOpenRouterChat } from '@/hooks/useOpenRouterChat'
import { CustomChatInput } from './CustomChatInput'
import { MermaidRenderer } from './MermaidRenderer'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AccentColor } from './ChatMessage'

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
  
  const languageRenderers = {
    mermaid: ({ code }: { code: string }) => {
      return <MermaidRenderer code={code} />
    }
  }
  
  // Apply accent class based on user selection for the whole chat
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
      <ChatMessages>
        <ChatMessages.List>
          {handler.messages.map((message, index) => {
            // Apply accent class to message wrapper
            const messageAccent = message.role === 'user' ? userAccent : 
                                message.role === 'assistant' ? aiAccent : 
                                undefined
            
            const messageClasses = cn(
              messageAccent && {
                'accent-blue': messageAccent === 'blue',
                'accent-green': messageAccent === 'green',
                'accent-purple': messageAccent === 'purple',
                'accent-orange': messageAccent === 'orange',
                'accent-pink': messageAccent === 'pink',
                'accent-teal': messageAccent === 'teal',
                'accent-neutral': messageAccent === 'neutral',
              }
            )
            
            return (
              <div key={index} className={messageClasses}>
                <ChatMessage
                  message={message}
                  isLast={index === handler.messages.length - 1}
                  isLoading={handler.isLoading}
                  append={handler.append}
                >
                  <ChatMessage.Avatar />
                  <ChatMessage.Content>
                    <ChatMessage.Content.Event />
                    <ChatMessage.Content.AgentEvent />
                    <ChatMessage.Content.Image />
                    <ChatMessage.Content.Markdown languageRenderers={languageRenderers} />
                    <ChatMessage.Content.DocumentFile />
                    <ChatMessage.Content.Source />
                    <ChatMessage.Content.SuggestedQuestions />
                  </ChatMessage.Content>
                  <ChatMessage.Actions />
                </ChatMessage>
              </div>
            )
          })}
          <ChatMessages.Empty />
          <ChatMessages.Loading />
        </ChatMessages.List>
      </ChatMessages>
      
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