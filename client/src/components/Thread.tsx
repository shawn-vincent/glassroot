import {
	ComposerPrimitive,
	MessagePrimitive,
	ThreadPrimitive,
	useThread,
} from "@assistant-ui/react";
import { Bot, Send, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Thread({ className }: { className?: string }) {
	return (
		<ThreadPrimitive.Root className={className}>
			<ThreadPrimitive.Viewport className="flex-1 overflow-auto p-4 space-y-4">
				<ThreadPrimitive.Empty>
					<div className="flex flex-col items-center justify-center h-full text-center space-y-4">
						<Bot size={48} className="text-muted-foreground" />
						<div>
							<h3 className="text-lg font-medium">Ready to Chat</h3>
							<p className="text-muted-foreground">
								Start a conversation by typing a message below.
							</p>
						</div>
					</div>
				</ThreadPrimitive.Empty>

				<ThreadPrimitive.Messages
					components={{
						UserMessage: UserMessage,
						AssistantMessage: AssistantMessage,
					}}
				/>
			</ThreadPrimitive.Viewport>

			<div className="border-t p-4">
				<Composer />
			</div>
		</ThreadPrimitive.Root>
	);
}

function UserMessage() {
	return (
		<MessagePrimitive.Root className="flex items-start space-x-3 justify-end">
			<div className="bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-xs md:max-w-md lg:max-w-lg">
				<MessageText />
			</div>
			<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
				<User size={16} className="text-white" />
			</div>
		</MessagePrimitive.Root>
	);
}

function AssistantMessage() {
	const isRunning = useThread((t) => t.isRunning);

	return (
		<MessagePrimitive.Root className="flex items-start space-x-3">
			<div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
				<Bot size={16} className="text-white" />
			</div>
			<div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-2 max-w-xs md:max-w-md lg:max-w-lg">
				<MessageText />
				{isRunning && (
					<div className="flex items-center space-x-1 mt-2">
						<div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
						<div
							className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
							style={{ animationDelay: "0.1s" }}
						/>
						<div
							className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
							style={{ animationDelay: "0.2s" }}
						/>
					</div>
				)}
			</div>
		</MessagePrimitive.Root>
	);
}

function MessageText() {
	return (
		<MessagePrimitive.Content
			components={{
				Text: ({ text }: { text: string }) => (
					<div className="prose prose-sm max-w-none">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
					</div>
				),
			}}
		/>
	);
}

function Composer() {
	return (
		<ComposerPrimitive.Root className="flex items-end space-x-2">
			<ComposerPrimitive.Input
				className="flex-1 border border-gray-300 rounded-lg px-3 py-2 resize-none min-h-[44px] max-h-32"
				placeholder="Type your message..."
				autoFocus
			/>
			<ComposerPrimitive.Send asChild>
				<button type="button" className="icon-button p-2">
					<Send size={20} />
				</button>
			</ComposerPrimitive.Send>
		</ComposerPrimitive.Root>
	);
}
