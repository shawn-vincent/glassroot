import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { Extension } from "@uiw/react-codemirror";
import { useEffect, useState, useMemo } from "react";

interface MarkdownEditorProps {
	value: string;
	onChange?: (value: string) => void;
	height?: string;
	minLines?: number;
	maxLines?: number;
	extensions?: Extension[];
	placeholder?: string;
	editable?: boolean;
	className?: string;
}

export function MarkdownEditor({
	value,
	onChange,
	height,
	minLines = 1,
	maxLines = 24,
	extensions = [],
	placeholder = "Enter text in Markdown...",
	editable = true,
	className,
}: MarkdownEditorProps) {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	
	// Calculate dynamic height based on content
	const calculatedHeight = useMemo(() => {
		if (height) return height; // Use explicit height if provided
		
		const lines = value.split("\n").length;
		// Add 1 extra line for better UX when typing
		const totalLines = Math.min(maxLines, Math.max(minLines, lines + 1));
		return `${totalLines * 20}px`;
	}, [value, height, minLines, maxLines]);

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

	// Configure editor extensions with markdown by default
	const editorExtensions = [
		markdown(), // Always include markdown highlighting
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
			height={calculatedHeight}
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