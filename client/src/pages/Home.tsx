import { ChatSection } from "@llamaindex/chat-ui";
import { useOpenRouterChat } from "@/hooks/useOpenRouterChat";

export default function Home() {
	const handler = useOpenRouterChat();
	return <ChatSection handler={handler} />;
}