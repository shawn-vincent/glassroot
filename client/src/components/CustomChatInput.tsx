import { ChatInput, useChatUI } from "@llamaindex/chat-ui";
import { MarkdownEditor } from "./ui/markdown-editor";
import { Button } from "./ui/button";
import { SendHorizontal } from "lucide-react";

export function CustomChatInput() {
	const { input, setInput, append, isLoading } = useChatUI();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		
		await append({
			content: input,
			role: "user"
		});
		setInput("");
	};

	return (
		<ChatInput className="border-t border-border bg-background">
			<form 
				onSubmit={handleSubmit}
				className="flex flex-col gap-2 p-4 pb-safe-keyboard"
			>
				<MarkdownEditor
					value={input}
					onChange={setInput}
					placeholder="Type a message..."
					minLines={1}
					maxLines={10}
					editable={!isLoading}
					className="flex-1"
				/>
				<div className="flex justify-end">
					<Button 
						type="submit" 
						disabled={isLoading || !input.trim()}
						size="sm"
						className="gap-2"
					>
						<SendHorizontal size={16} />
						Send
					</Button>
				</div>
			</form>
		</ChatInput>
	);
}