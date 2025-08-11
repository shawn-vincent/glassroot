import { ChatInput, useChatUI } from "@llamaindex/chat-ui";
import { MarkdownEditor } from "./ui/markdown-editor";
import { IconButton } from "./ui/icon-button";
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
		<div className="border-t backdrop-blur-sm" style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--bg-alt) 50%, transparent)' }}>
		<ChatInput>
			<form 
				onSubmit={handleSubmit}
				className="flex items-end gap-3 p-4 pb-safe-keyboard"
			>
				<div className="flex-1 relative group">
					<div className="rounded-bubble border transition-all duration-200 focus-within:shadow-lg" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
						<MarkdownEditor
							value={input}
							onChange={setInput}
							placeholder="Ask anything..."
							minLines={1}
							maxLines={10}
							editable={!isLoading}
							className="w-full px-4 py-3 pr-12"
						/>
					</div>
					<div className="absolute inset-0 rounded-bubble opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 5%, transparent), transparent)' }} />
				</div>
				<IconButton 
					type="submit" 
					disabled={isLoading || !input.trim()}
					variant="default"
					size="sm"
					className="flex-shrink-0 rounded-full w-10 h-10 disabled:opacity-50 transition-all duration-200 hover:scale-110 shadow-lg border-2"
					style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }}
					onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-muted)' }}
					onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
				>
					<ArrowUp size={20} style={{ color: 'var(--accent-contrast)' }} />
				</IconButton>
			</form>
		</ChatInput>
		</div>
	);
}