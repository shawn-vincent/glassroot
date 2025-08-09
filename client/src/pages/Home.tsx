"use client";

import { ChatSection, ChatMessages, ChatInput } from "@llamaindex/chat-ui";
import { useOpenRouterChat } from "@/hooks/useOpenRouterChat";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
	const handler = useOpenRouterChat();
	const [chatVisible, setChatVisible] = useState(false);

	return (
		<div className="h-full flex flex-col relative">
			{!chatVisible ? (
				<div className="flex flex-col items-center justify-center h-full p-8">
					<Button
						onClick={() => setChatVisible(true)}
						size="lg"
						className="flex items-center gap-2"
					>
						<MessageSquare size={20} />
						Start Chat
					</Button>
				</div>
			) : (
				<ChatSection handler={handler} className="h-full flex flex-col">
					<div className="flex-1 overflow-y-auto">
						<ChatMessages />
					</div>
					<div className="sticky bottom-0 bg-background border-t p-4">
						<ChatInput>
							<ChatInput.Form className="flex gap-2">
								<ChatInput.Field 
									placeholder="Type your message..."
									className="flex-1 min-h-[44px] max-h-[200px]"
								/>
								<ChatInput.Submit />
							</ChatInput.Form>
						</ChatInput>
					</div>
				</ChatSection>
			)}
		</div>
	);
}