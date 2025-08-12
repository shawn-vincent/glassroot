import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
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
	onKeyDown?: (event: KeyboardEvent) => boolean | undefined;
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
	onKeyDown,
}: MarkdownEditorProps) {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	
	// Calculate dynamic height based on content
	const calculatedHeight = useMemo(() => {
		if (height) return height; // Use explicit height if provided
		
		const lines = value.split("\n").length;
		// Add 1 extra line for better UX when typing
		const totalLines = Math.min(maxLines, Math.max(minLines, lines + 1));
		// Use 1rem per line
		return `${totalLines}rem`;
	}, [value, height, minLines, maxLines]);

	// Create highlight style for monospace code
	const monospaceHighlight = useMemo(() => 
		syntaxHighlighting(HighlightStyle.define([
			{ tag: t.monospace, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			// Markdown meta characters (```, language names, etc.)
			{ tag: t.meta, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.processingInstruction, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.labelName, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			// Also style specific code-related tags
			{ tag: t.string, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.keyword, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.atom, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.number, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.comment, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.variableName, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.typeName, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.propertyName, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
			{ tag: t.operator, fontFamily: "var(--font-mono, ui-monospace, monospace)" },
		]))
	, []);

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

	// Configure editor extensions with markdown and code language support
	const editorExtensions = useMemo(() => {
		const exts: Extension[] = [];
		
		// Add custom keymap with HIGH precedence to override defaults
		if (onKeyDown) {
			exts.push(
				Prec.high(keymap.of([
					{
						key: "Enter",
						preventDefault: true,
						run: (view) => {
							const event = new KeyboardEvent('keydown', {
								key: 'Enter',
								shiftKey: false,
								ctrlKey: false,
								metaKey: false,
								altKey: false
							});
							const result = onKeyDown(event);
							if (result === false) {
								// Handler handled it
								return true;
							}
							// Insert newline
							view.dispatch(view.state.replaceSelection('\n'));
							return true;
						}
					},
					{
						key: "Shift-Enter",
						preventDefault: true,
						run: (view) => {
							const event = new KeyboardEvent('keydown', {
								key: 'Enter',
								shiftKey: true,
								ctrlKey: false,
								metaKey: false,
								altKey: false
							});
							const result = onKeyDown(event);
							if (result === false) {
								// Handler handled it
								return true;
							}
							// Insert newline
							view.dispatch(view.state.replaceSelection('\n'));
							return true;
						}
					},
					{
						key: "Ctrl-Enter",
						preventDefault: true,
						run: (view) => {
							const event = new KeyboardEvent('keydown', {
								key: 'Enter',
								shiftKey: false,
								ctrlKey: true,
								metaKey: false,
								altKey: false
							});
							const result = onKeyDown(event);
							if (result === false) {
								// Handler handled it
								return true;
							}
							// Not handled, let default happen
							return false;
						}
					},
					{
						key: "Cmd-Enter",
						preventDefault: true,
						run: (view) => {
							const event = new KeyboardEvent('keydown', {
								key: 'Enter',
								shiftKey: false,
								ctrlKey: false,
								metaKey: true,
								altKey: false
							});
							const result = onKeyDown(event);
							if (result === false) {
								// Handler handled it
								return true;
							}
							// Not handled, let default happen
							return false;
						}
					},
					{
						key: "Alt-Enter",
						preventDefault: true,
						run: (view) => {
							const event = new KeyboardEvent('keydown', {
								key: 'Enter',
								shiftKey: false,
								ctrlKey: false,
								metaKey: false,
								altKey: true
							});
							const result = onKeyDown(event);
							if (result === false) {
								// Handler handled it
								return true;
							}
							// Not handled, let default happen
							return false;
						}
					}
				]))
			);
		}
		
		// Add other extensions
		exts.push(
			markdown({ 
				codeLanguages: languages // Enable syntax highlighting in code blocks
			}),
			monospaceHighlight, // Apply monospace font to code
			...extensions,
			EditorView.lineWrapping
		);
		
		exts.push(EditorView.theme({
			"&": {
				fontFamily: "var(--font-sans)",
				borderRadius: "0.375rem", // Slightly rounded corners (6px)
				overflow: "hidden",
			},
			".cm-content": {
				fontFamily: "var(--font-sans)",
				padding: "4px 0", // Equal top and bottom padding
			},
			".cm-gutters": {
				display: "none",
			},
			".cm-activeLine": {
				backgroundColor: "transparent !important", // Turn off current line highlighting
			},
			".cm-activeLineGutter": {
				backgroundColor: "transparent !important",
			},
		}));
		
		return exts;
	}, [extensions, onKeyDown, monospaceHighlight]);

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