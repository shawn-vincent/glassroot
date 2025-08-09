import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import ModelPicker from "./ModelPicker";
import PromptEditor from "./PromptEditor";

type Props = { onClose: () => void };

export default function ConfigPanel({ onClose }: Props) {
	const [apiKey, setApiKey] = useState("");
	const [model, setModel] = useState("");
	const [prompt, setPrompt] = useState("");
	const [show, setShow] = useState(false);

	useEffect(() => {
		setApiKey(localStorage.getItem("openrouter_api_key") || "");
		setModel(localStorage.getItem("openrouter_model") || "");
		setPrompt(localStorage.getItem("llm_prompt") || "");
	}, []);

	function save() {
		localStorage.setItem("openrouter_api_key", apiKey.trim());
		localStorage.setItem("openrouter_model", model.trim());
		localStorage.setItem("llm_prompt", prompt);
		onClose();
	}

	return (
		<Sheet open={true} onOpenChange={(open) => !open && onClose()}>
			<SheetContent className="w-[720px] max-w-[95vw] flex flex-col overflow-hidden">
				<SheetHeader className="px-6 pt-6 flex-shrink-0">
					<SheetTitle>Configuration</SheetTitle>
				</SheetHeader>
				<div className="flex-1 overflow-y-auto px-6">
					<div className="space-y-6 py-6">
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
							<Button
								variant="outline"
								size="icon"
								onClick={() => setShow((s) => !s)}
							>
								{show ? <EyeOff size={20} /> : <Eye size={20} />}
							</Button>
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
							<PromptEditor value={prompt} onChange={setPrompt} />
						</div>
					</div>
				</div>
				<SheetFooter className="px-6 pb-2 flex-shrink-0">
					<Button onClick={save}>Save Settings</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
