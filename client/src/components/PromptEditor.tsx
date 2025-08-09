import { markdown } from "@codemirror/lang-markdown";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useState } from "react";

type Props = {
	value: string;
	onChange: (v: string) => void;
};

export default function PromptEditor({ value, onChange }: Props) {
	const extensions = useMemo(() => [markdown()], []);
	const [height, setHeight] = useState("240px");
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		const lines = Math.min(24, Math.max(6, value.split("\n").length + 2));
		setHeight(`${lines * 20}px`);
	}, [value]);

	useEffect(() => {
		// Check for dark mode class on documentElement
		const checkTheme = () => {
			const isDark = document.documentElement.classList.contains("dark");
			setTheme(isDark ? "dark" : "light");
		};

		checkTheme();

		// Watch for theme changes
		const observer = new MutationObserver(checkTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	return (
		<CodeMirror
			value={value}
			height={height}
			extensions={extensions}
			onChange={onChange}
			theme={theme === "dark" ? githubDark : githubLight}
		/>
	);
}