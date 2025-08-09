import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { Extension } from "@uiw/react-codemirror";
import { useEffect, useState } from "react";

interface CodeEditorProps {
	value: string;
	onChange?: (value: string) => void;
	height?: string;
	extensions?: Extension[];
	placeholder?: string;
	editable?: boolean;
	className?: string;
}

export function CodeEditor({
	value,
	onChange,
	height = "auto",
	extensions = [],
	placeholder,
	editable = true,
	className,
}: CodeEditorProps) {
	const [theme, setTheme] = useState<"light" | "dark">("light");

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

	// Configure editor extensions for line wrapping, no line numbers, and proportional font
	const editorExtensions = [
		...extensions,
		EditorView.lineWrapping,
		EditorView.theme({
			"&": {
				fontFamily: "var(--font-sans)",
			},
			".cm-content": {
				fontFamily: "var(--font-sans)",
			},
			".cm-gutters": {
				display: "none",
			},
		}),
	];

	return (
		<CodeMirror
			value={value}
			height={height}
			extensions={editorExtensions}
			onChange={onChange}
			theme={theme === "dark" ? githubDark : githubLight}
			placeholder={placeholder}
			editable={editable}
			className={className}
			basicSetup={{
				lineNumbers: false,
				foldGutter: false,
				dropCursor: false,
				allowMultipleSelections: false,
				indentOnInput: true,
				bracketMatching: true,
				closeBrackets: true,
				autocompletion: true,
				rectangularSelection: false,
				highlightSelectionMatches: false,
				searchKeymap: false,
			}}
		/>
	);
}