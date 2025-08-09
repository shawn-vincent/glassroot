import { markdown } from "@codemirror/lang-markdown";
import { useEffect, useMemo, useState } from "react";
import { CodeEditor } from "./ui/code-editor";

type Props = {
	value: string;
	onChange: (v: string) => void;
};

export default function PromptEditor({ value, onChange }: Props) {
	const extensions = useMemo(() => [markdown()], []);
	const [height, setHeight] = useState("240px");

	useEffect(() => {
		const lines = Math.min(24, Math.max(6, value.split("\n").length + 2));
		setHeight(`${lines * 20}px`);
	}, [value]);

	return (
		<CodeEditor
			value={value}
			onChange={onChange}
			height={height}
			extensions={extensions}
			placeholder="Enter your system prompt in Markdown..."
		/>
	);
}