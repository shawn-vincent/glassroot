import { ChatInput, useChatUI } from "@llamaindex/chat-ui";
import { MarkdownEditor } from "./ui/markdown-editor";
import { IconButton } from "./ui/icon-button";
import { ArrowUp } from "lucide-react";
import { getBubbleStyles } from '@/lib/bubble-styles';
import type { AccentColor } from './ChatMessage';

interface CustomChatInputProps {
	userAccent?: AccentColor;
}

export function CustomChatInput({ userAccent }: CustomChatInputProps) {
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
				className="p-4 pb-safe-keyboard"
			>
				<div className="relative group">
					<div 
						className={`rounded-bubble transition-all duration-200 focus-within:shadow-lg flex items-end ${userAccent ? 'border-2' : 'border'}`}
						style={getBubbleStyles({ accent: userAccent })}
					>
						<MarkdownEditor
							value={input}
							onChange={setInput}
							placeholder="Ask anything..."
							minLines={1}
							maxLines={10}
							editable={!isLoading}
							className="flex-1 px-3 py-2.5"
						/>
						<div className="pr-2 pb-2">
							<IconButton 
								type="submit" 
								disabled={isLoading || !input.trim()}
								variant="default"
								size="sm"
								className="flex-shrink-0 rounded-full w-8 h-8 disabled:opacity-50 transition-all duration-200 hover:scale-110 shadow-md"
								style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }}
								onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-muted)' }}
								onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
							>
								<ArrowUp size={18} style={{ color: 'var(--accent-contrast)' }} />
							</IconButton>
						</div>
					</div>
					{userAccent && (
						<div className="absolute inset-0 rounded-bubble opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 5%, transparent), transparent)' }} />
					)}
				</div>
			</form>
		</ChatInput>
		</div>
	);
}