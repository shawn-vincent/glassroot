import { IconButton } from "@/components/ui/icon-button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const [theme, setTheme] = useState(() => {
		const saved = localStorage.getItem("theme");
		return saved === "dark" ? "dark" : "light";
	});

	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	return (
		<IconButton
			variant="outline"
			onClick={toggleTheme}
			title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
		>
			{theme === "light" ? <Sun size={24} /> : <Moon size={24} />}
		</IconButton>
	);
}