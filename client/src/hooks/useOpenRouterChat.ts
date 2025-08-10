import { useCallback, useRef, useState } from "react";

type JSONValue = null | string | number | boolean | {
	[value: string]: JSONValue;
} | JSONValue[];

export type Message = {
	id?: string;
	role: "user" | "assistant" | "system" | "data";
	content: string;
	annotations?: JSONValue[];
};

export type ChatHandler = {
	messages: Message[];
	input: string;
	setInput: (value: string) => void;
	isLoading: boolean;
	append: (message: Message, options?: { data?: Record<string, JSONValue> }) => Promise<string | null | undefined>;
	stop: () => void;
	reload?: () => Promise<void>;
	setMessages: (messages: Message[]) => void;
};

function nanoid() {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useOpenRouterChat(): ChatHandler {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	const append = useCallback(
		async (
			message: Message,
			options?: { data?: Record<string, JSONValue> }
		): Promise<string | null | undefined> => {
			// Ensure message has an ID
			const newMessage: Message = {
				...message,
				id: message.id || nanoid(),
			};

			// Add user message
			setMessages((prev) => [...prev, newMessage]);
			setIsLoading(true);

			// Get configuration from localStorage
			const apiKey = localStorage.getItem("openrouter_api_key") || "";
			const model = localStorage.getItem("openrouter_model") || "openai/gpt-4o-mini";
			const systemPrompt = localStorage.getItem("llm_prompt") || "";

			if (!apiKey) {
				const errorMessage: Message = {
					id: nanoid(),
					role: "assistant",
					content: "Please configure your OpenRouter API key in settings.",
				};
				setMessages((prev) => [...prev, errorMessage]);
				setIsLoading(false);
				return null;
			}

			// Prepare messages for API (filter out non-standard roles)
			const apiMessages = [...messages, newMessage]
				.filter(m => ["user", "assistant", "system"].includes(m.role))
				.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));
			
			// Add system prompt if provided
			if (systemPrompt && !apiMessages.some(m => m.role === "system")) {
				apiMessages.unshift({ role: "system", content: systemPrompt });
			}

			// Create new AbortController for this request
			abortControllerRef.current = new AbortController();

			try {
				const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
					method: "POST",
					headers: {
						"Authorization": `Bearer ${apiKey}`,
						"Content-Type": "application/json",
						"HTTP-Referer": window.location.origin,
						"X-Title": "Glassroot Chat",
					},
					body: JSON.stringify({
						model,
						messages: apiMessages,
						stream: true,
						temperature: 0.7,
						...(options?.data || {}),
					}),
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					const error = await response.text();
					throw new Error(`OpenRouter API error: ${error}`);
				}

				// Create assistant message
				const assistantMessage: Message = {
					id: nanoid(),
					role: "assistant",
					content: "",
				};
				setMessages((prev) => [...prev, assistantMessage]);

				// Process the stream
				const reader = response.body?.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				if (reader) {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split("\n");
						buffer = lines.pop() || "";

						for (const line of lines) {
							const trimmedLine = line.trim();
							if (trimmedLine === "" || trimmedLine === "data: [DONE]") continue;
							if (trimmedLine.startsWith("data: ")) {
								try {
									const json = JSON.parse(trimmedLine.slice(6));
									const content = json.choices?.[0]?.delta?.content || "";
									if (content) {
										setMessages((prev) => {
											const newMessages = prev.map((msg, idx) => {
												if (idx === prev.length - 1 && msg.role === "assistant") {
													return { ...msg, content: msg.content + content };
												}
												return msg;
											});
											return newMessages;
										});
									}
								} catch (e) {
									console.error("Error parsing SSE:", e);
								}
							}
						}
					}
				}

				return assistantMessage.id;
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					console.log("Request aborted");
				} else {
					console.error("Chat error:", error);
					const errorMessage: Message = {
						id: nanoid(),
						role: "assistant",
						content: `Error: ${error instanceof Error ? error.message : String(error)}`,
					};
					setMessages((prev) => [...prev, errorMessage]);
				}
			} finally {
				setIsLoading(false);
				abortControllerRef.current = null;
			}
			return null;
		},
		[messages]
	);

	const stop = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			setIsLoading(false);
		}
	}, []);

	const reload = useCallback(async () => {
		if (messages.length === 0) return;

		// Remove last assistant message if exists
		let lastUserMessageIndex = -1;
		for (let i = messages.length - 1; i >= 0; i--) {
			if (messages[i].role === "user") {
				lastUserMessageIndex = i;
				break;
			}
		}
		if (lastUserMessageIndex !== -1) {
			const newMessages = messages.slice(0, lastUserMessageIndex + 1);
			setMessages(newMessages);
			
			// Resend last user message
			const lastUserMessage = messages[lastUserMessageIndex];
			await append(lastUserMessage);
		}
	}, [messages, append]);

	return {
		messages,
		input,
		setInput,
		isLoading,
		append,
		stop,
		reload,
		setMessages,
	};
}