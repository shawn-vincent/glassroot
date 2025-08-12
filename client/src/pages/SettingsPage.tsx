import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Palette, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import ModelPicker from "@/components/ModelPicker";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import type { AccentColor } from "@/components/ChatMessage";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";

export default function SettingsPage() {
	const [apiKey, setApiKey] = useState("");
	const [model, setModel] = useState("");
	const [prompt, setPrompt] = useState("");
	const [show, setShow] = useState(false);
	const [userAccent, setUserAccent] = useState<AccentColor>("blue");
	const [aiAccent, setAiAccent] = useState<AccentColor>("purple");

	useEffect(() => {
		setApiKey(localStorage.getItem("openrouter_api_key") || "");
		setModel(localStorage.getItem("openrouter_model") || "");
		setPrompt(localStorage.getItem("llm_prompt") || "");
		setUserAccent((localStorage.getItem("user_accent_color") as AccentColor) || "blue");
		setAiAccent((localStorage.getItem("ai_accent_color") as AccentColor) || "purple");
	}, []);

	function save() {
		localStorage.setItem("openrouter_api_key", apiKey.trim());
		localStorage.setItem("openrouter_model", model.trim());
		localStorage.setItem("llm_prompt", prompt);
		localStorage.setItem("user_accent_color", userAccent);
		localStorage.setItem("ai_accent_color", aiAccent);
		toast.success("Settings saved successfully!");
		// Reload to apply new accent colors
		setTimeout(() => window.location.reload(), 500);
	}

	return (
		<PageLayout
			title="Settings"
			description="Configure your AI chat settings and preferences"
			icon={Settings}
		>
			<div className="space-y-6">
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
						
						{/* Accent Color Pickers */}
						<div className="space-y-4 border-t pt-4">
							<h3 className="text-sm font-medium flex items-center gap-2">
								<Palette className="w-4 h-4" />
								Accent Colors
							</h3>
							
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