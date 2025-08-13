import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Settings, Send, CornerDownLeft } from "lucide-react";
import { useEffect, useState } from "react";
import ModelPicker from "@/components/ModelPicker";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import { toast } from "sonner";
import { applyAccentColor, type AccentColor, getDefaultAccentColor } from "@/lib/theme-colors";
import { PageLayout } from "@/components/PageLayout";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
	const [apiKey, setApiKey] = useState("");
	const [model, setModel] = useState("");
	const [prompt, setPrompt] = useState("");
	const [show, setShow] = useState(false);
	const [userAccent, setUserAccent] = useState<AccentColor>(getDefaultAccentColor());
	const [aiAccent, setAiAccent] = useState<AccentColor>("purple");
	const [enterBehavior, setEnterBehavior] = useState<"send" | "newline">("send");

	useEffect(() => {
		setApiKey(localStorage.getItem("openrouter_api_key") || "");
		setModel(localStorage.getItem("openrouter_model") || "");
		setPrompt(localStorage.getItem("llm_prompt") || "");
		setUserAccent((localStorage.getItem("user_accent_color") as AccentColor) || getDefaultAccentColor());
		setAiAccent((localStorage.getItem("ai_accent_color") as AccentColor) || "purple");
		setEnterBehavior((localStorage.getItem("enter_key_behavior") as "send" | "newline") || "send");
	}, []);

	function save() {
		localStorage.setItem("openrouter_api_key", apiKey.trim());
		localStorage.setItem("openrouter_model", model.trim());
		localStorage.setItem("llm_prompt", prompt);
		localStorage.setItem("user_accent_color", userAccent);
		localStorage.setItem("ai_accent_color", aiAccent);
		localStorage.setItem("enter_key_behavior", enterBehavior);
		
		// Update the accent color immediately using CSS variables
		const isDark = document.documentElement.classList.contains("dark");
		applyAccentColor(userAccent, isDark);
		
		toast.success("Settings saved successfully!");
		// No need to reload - colors update immediately
	}

	return (
		<PageLayout
			title="Settings"
			description="Configure your AI chat settings and preferences"
			icon={Settings}
		>
			<div className="space-y-8">
				{/* Assistant Settings Section */}
				<div className="space-y-6">
					<h2 className="text-lg font-semibold">Assistant Settings</h2>
					
					<div className="space-y-2">
						<Label htmlFor="cfg_api_key">OpenRouter API Key</Label>
						<div className="flex gap-2">
							<Input
								id="cfg_api_key"
								type={show ? "text" : "password"}
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder="sk-or-..."
							/>
							<IconButton
								variant="outline"
								onClick={() => setShow((s) => !s)}
							>
								{show ? <EyeOff size={24} /> : <Eye size={24} />}
							</IconButton>
						</div>
						{!apiKey && (
							<p className="text-xs text-muted-foreground">
								Get your API key at{" "}
								<a
									href="https://openrouter.ai/settings/keys"
									target="_blank"
									rel="noopener noreferrer"
									className="underline hover:text-primary"
								>
									openrouter.ai/settings/keys
								</a>
							</p>
						)}
						{apiKey && !apiKey.startsWith("sk-or-") && (
							<p className="text-xs text-destructive">
								API key should start with "sk-or-"
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="cfg_model">Model</Label>
						<ModelPicker value={model} onChange={setModel} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="cfg_prompt">System Prompt (Markdown)</Label>
						<MarkdownEditor 
							value={prompt} 
							onChange={setPrompt}
							placeholder="Enter your system prompt in Markdown..."
							minLines={6}
							maxLines={24}
						/>
					</div>
				</div>

				{/* UI Settings Section */}
				<div className="space-y-6 border-t pt-6">
					<h2 className="text-lg font-semibold">UI Settings</h2>
					
					<div className="space-y-2">
						<Label>Theme</Label>
						<ThemeToggle />
					</div>

					<div className="space-y-2">
						<Label htmlFor="enter_behavior">Enter Key Behavior (Desktop)</Label>
						<Select value={enterBehavior} onValueChange={(value: "send" | "newline") => setEnterBehavior(value)}>
							<SelectTrigger id="enter_behavior" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="send">
									<div className="flex items-center gap-2">
										<Send className="h-4 w-4" />
										<span>Send message</span>
									</div>
								</SelectItem>
								<SelectItem value="newline">
									<div className="flex items-center gap-2">
										<CornerDownLeft className="h-4 w-4" />
										<span>Insert new line</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
						<div className="text-xs text-muted-foreground space-y-1">
							<p>• <strong>Shift+Enter</strong>: Always inserts a new line</p>
							<p>• <strong>{navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd+Enter, Ctrl+Enter, or Option+Enter' : 'Ctrl+Enter or Alt+Enter'}</strong>: Always sends the message</p>
							<p>• <strong>Enter</strong>: Configurable (see above)</p>
							<p className="mt-2">On mobile devices, Enter always inserts a new line.</p>
						</div>
					</div>
					
					<AccentColorPicker
						value={userAccent}
						onChange={setUserAccent}
						label="Your Accent Color"
						description="This color will be used for your messages and the input field"
					/>
					
					<AccentColorPicker
						value={aiAccent}
						onChange={setAiAccent}
						label="AI Assistant Accent Color"
						description="This color will be used for AI assistant messages"
					/>
				</div>
			</div>

			<div className="flex justify-end pt-4">
				<Button onClick={save} size="lg">Save Settings</Button>
			</div>
		</PageLayout>
	);
}