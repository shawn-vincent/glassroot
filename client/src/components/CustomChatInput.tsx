import { ChatInput, useChatUI } from "@llamaindex/chat-ui";
import { MarkdownEditor } from "./ui/markdown-editor";
import { Button } from "./ui/button";
import { ArrowUp } from "lucide-react";

export function CustomChatInput() {
	const { input, setInput, append, isLoading } = useChatUI();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		
		// Double newlines to turn them into paragraphs
		const formattedContent = input.replace(/\n/g, '\n\n');
		
		await append({
			content: formattedContent,
			role: "user"
		});
		setInput("");
	};

	return (
		<ChatInput className="border-t border-border bg-background">
			<form 
				onSubmit={handleSubmit}
				className="flex items-end gap-2 p-4 pb-safe-keyboard"
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
				<Button 
					type="submit" 
					disabled={isLoading || !input.trim()}
					size="icon"
					className="rounded-full h-8 w-8 flex-shrink-0"
				>
					<ArrowUp size={16} />
				</Button>
			</form>
		</ChatInput>
	);
}