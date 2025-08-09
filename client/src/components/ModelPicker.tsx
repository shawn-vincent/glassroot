import { useEffect, useMemo, useState } from "react";
import Select, { type StylesConfig } from "react-select";

type Option = { value: string; label: string };

async function fetchModels(): Promise<Option[]> {
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
	const [options, setOptions] = useState<Option[]>([]);
	const [loading, setLoading] = useState(false);
	const selected = useMemo(
		() =>
			options.find((o) => o.value === value) ||
			(value ? { value, label: value } : null),
		[options, value],
	);

	useEffect(() => {
		const cached = localStorage.getItem("openrouter_models");
		if (cached) {
			try {
				setOptions(JSON.parse(cached));
			} catch {}
		}
		setLoading(true);
		fetchModels()
			.then((opts) => {
				if (opts.length) {
					setOptions(opts);
					localStorage.setItem("openrouter_models", JSON.stringify(opts));
				}
			})
			.finally(() => setLoading(false));
	}, []);

	const styles: StylesConfig<Option, false> = {
		control: (base) => ({
			...base,
			background: "transparent",
			borderColor: "var(--color-input-border)",
			color: "var(--color-foreground)",
		}),
		menu: (base) => ({
			...base,
			background: "var(--color-background)",
			color: "var(--color-foreground)",
		}),
		singleValue: (base) => ({ ...base, color: "var(--color-foreground)" }),
		input: (base) => ({ ...base, color: "var(--color-foreground)" }),
		option: (base, state) => ({
			...base,
			background: state.isFocused ? "var(--color-border)" : "transparent",
			color: "var(--color-foreground)",
		}),
	};

	return (
		<Select
			isClearable
			isSearchable
			isLoading={loading}
			options={options}
			value={selected}
			placeholder="Select a model…"
			onChange={(opt: Option | null) => onChange(opt?.value || "")}
			styles={styles}
		/>
	);
}
