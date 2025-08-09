import {
  ChatSection as ChatSectionUI,
} from '@llamaindex/chat-ui'

import '@llamaindex/chat-ui/styles/markdown.css'
import '@llamaindex/chat-ui/styles/pdf.css'
import '@llamaindex/chat-ui/styles/editor.css'
import { useOpenRouterChat } from '@/hooks/useOpenRouterChat'

export function ChatSection() {
  const handler = useOpenRouterChat()
  return <ChatSectionUI handler={handler} className="h-full" />
}