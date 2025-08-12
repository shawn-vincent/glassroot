import { ChatInput, useChatUI } from "@llamaindex/chat-ui";
import { MarkdownEditor } from "./ui/markdown-editor";
import { IconButton } from "./ui/icon-button";
import { ArrowUp } from "lucide-react";
import { getBubbleStyles } from '@/lib/bubble-styles';
import type { AccentColor } from './ChatMessage';
import { platform } from '@/utils/platform';
import { useEffect, useState } from 'react';

interface CustomChatInputProps {
	userAccent?: AccentColor;
}

export function CustomChatInput({ userAccent }: CustomChatInputProps) {
	const { input, setInput, append, isLoading } = useChatUI();
	const [enterBehavior, setEnterBehavior] = useState<'send' | 'newline'>('send');
	
	// Load enter behavior preference on mount
	useEffect(() => {
		const saved = localStorage.getItem('enter_key_behavior');
		if (saved === 'newline' || saved === 'send') {
			setEnterBehavior(saved);
		}
	}, []);

	const handleSubmit = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!input.trim() || isLoading) return;
		
		// Double newlines to turn them into paragraphs
		const formattedContent = input.replace(/\n/g, '\n\n');
		
		// Clear input immediately
		setInput("");
		
		// Submit the message
		await append({
			content: formattedContent,
			role: "user"
		});
		
		// Focus back on the input after a brief delay to ensure DOM updates
		setTimeout(() => {
			const editor = document.querySelector('.cm-editor .cm-content') as HTMLElement;
			if (editor) {
				editor.focus();
			}
		}, 50);
	};
	
	const handleKeyDown = (e: KeyboardEvent) => {
		// Only handle Enter key
		if (e.key !== 'Enter') {
			return undefined;
		}
		
		const isMobile = platform.isIOS || platform.isAndroid || platform.hasTouch;
		
		// Shift+Enter: Always insert newline (let CodeMirror handle)
		if (e.shiftKey) {
			return undefined;
		}
		
		// Ctrl+Enter, Cmd+Enter, or Alt/Option+Enter: Always send message
		if (e.ctrlKey || e.metaKey || e.altKey) {
			handleSubmit();
			return false; // We handled it
		}
		
		// Plain Enter
		// On mobile, always insert newline
		if (isMobile) {
			return undefined;
		}
		
		// On desktop, use configured behavior
		if (enterBehavior === 'send') {
			handleSubmit();
			return false; // We handled it
		}
		
		// enterBehavior === 'newline' - let CodeMirror insert newline
		return undefined;
	};

	return (
		<div className="border-t backdrop-blur-sm" style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--bg-alt) 50%, transparent)' }}>
		<ChatInput>
			<form 
				onSubmit={handleSubmit}
				className="px-4 pt-1 pb-4 pb-safe-keyboard"
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
							className="flex-1 px-3 py-1.5"
							onKeyDown={handleKeyDown}
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