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

export function ChatSection() {
  const handler = useOpenRouterChat()
  
  const languageRenderers = {
    mermaid: ({ code }: { code: string }) => {
      return <MermaidRenderer code={code} />
    }
  }
  
  return (
    <ChatSectionUI handler={handler} className="h-full">
      <ChatMessages>
        <ChatMessages.List>
          {handler.messages.map((message, index) => (
            <ChatMessage
              key={index}
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
          ))}
          <ChatMessages.Empty />
          <ChatMessages.Loading />
        </ChatMessages.List>
      </ChatMessages>
      <CustomChatInput />
    </ChatSectionUI>
  )
}