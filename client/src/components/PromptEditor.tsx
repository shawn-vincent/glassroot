import { markdown } from "@codemirror/lang-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useState } from "react";

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
		<CodeMirror
			value={value}
			height={height}
			extensions={extensions}
			onChange={onChange}
			theme={
				document.documentElement.getAttribute("data-theme") === "dark"
					? "dark"
					: "light"
			}
		/>
	);
}
