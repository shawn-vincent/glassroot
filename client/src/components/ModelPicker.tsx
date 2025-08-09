import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Model = { value: string; label: string };

async function fetchModels(): Promise<Model[]> {
	try {
		const res = await fetch("https://openrouter.ai/api/v1/models");
		const data = await res.json();
		const models: Array<{ id: string; name?: string }> = data?.data || [];
		return models.map((m) => ({
			value: m.id,
			label: `${m.id}${m.name ? ` — ${m.name}` : ""}`,
		}));
	} catch {
		return [];
	}
}

export default function ModelPicker({
	value,
	onChange,
}: { value: string; onChange: (v: string) => void }) {
	const [open, setOpen] = useState(false);
	const [models, setModels] = useState<Model[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchValue, setSearchValue] = useState("");

	useEffect(() => {
		const cached = localStorage.getItem("openrouter_models");
		if (cached) {
			try {
				setModels(JSON.parse(cached));
			} catch {}
		}
		setLoading(true);
		fetchModels()
			.then((opts) => {
				if (opts.length) {
					setModels(opts);
					localStorage.setItem("openrouter_models", JSON.stringify(opts));
				}
			})
			.finally(() => setLoading(false));
	}, []);

	const selectedModel = models.find((m) => m.value === value);
	const displayValue = selectedModel?.label || value || "Select a model...";

	// Filter models based on search
	const filteredModels = models.filter((model) =>
		model.label.toLowerCase().includes(searchValue.toLowerCase()),
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between font-normal"
					disabled={loading && models.length === 0}
				>
					<span className="truncate">{displayValue}</span>
					{loading && models.length === 0 ? (
						<Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
					) : (
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] p-0"
				align="start"
			>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search models..."
						value={searchValue}
						onValueChange={setSearchValue}
					/>
					<CommandList>
						{loading && models.length === 0 ? (
							<CommandEmpty>Loading models...</CommandEmpty>
						) : filteredModels.length === 0 ? (
							<CommandEmpty>No models found.</CommandEmpty>
						) : (
							<CommandGroup>
								{/* Add clear option */}
								<CommandItem
									value=""
									onSelect={() => {
										onChange("");
										setOpen(false);
										setSearchValue("");
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === "" ? "opacity-100" : "opacity-0",
										)}
									/>
									<span className="text-muted-foreground">Clear selection</span>
								</CommandItem>
								{/* Model options */}
								{filteredModels.map((model) => (
									<CommandItem
										key={model.value}
										value={model.value}
										onSelect={(currentValue) => {
											onChange(currentValue === value ? "" : currentValue);
											setOpen(false);
											setSearchValue("");
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === model.value ? "opacity-100" : "opacity-0",
											)}
										/>
										<span className="truncate">{model.label}</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
