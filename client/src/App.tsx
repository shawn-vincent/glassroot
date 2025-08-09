import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Settings, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import ConfigPanel from "./components/ConfigPanel";
import OfflineIndicator from "./components/OfflineIndicator";
import { Toaster } from "./components/ui/sonner";

export default function App() {
	const [showConfig, setShowConfig] = useState(false);
	const { pathname } = useLocation();
	// Apply persisted theme at app mount to avoid mismatch
	useEffect(() => {
		const saved = localStorage.getItem("theme");
		const theme = saved === "dark" ? "dark" : "light";
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, []);
	return (
		<div className="h-full flex flex-col overflow-hidden">
			<header className="flex-shrink-0 flex items-center justify-between px-4 py-3 md:py-3 border-b border-border bg-background z-10 pt-safe">
				<nav className="flex gap-4">
					<Link
						to="/"
						className={
							pathname === "/"
								? "text-foreground font-semibold"
								: "text-muted-foreground hover:text-foreground no-underline"
						}
					>
						Chat
					</Link>
					<Link
						to="/documents"
						className={
							pathname.startsWith("/documents")
								? "text-foreground font-semibold"
								: "text-muted-foreground hover:text-foreground no-underline"
						}
					>
						Documents
					</Link>
					<Link
						to="/search"
						className={
							pathname.startsWith("/search")
								? "text-foreground font-semibold"
								: "text-muted-foreground hover:text-foreground no-underline"
						}
					>
						Search
					</Link>
				</nav>
				<div className="flex gap-2 items-center">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowConfig(true)}
						aria-label="Settings"
					>
						<Settings size={24} />
					</Button>
				</div>
			</header>
			<OfflineIndicator />
			<Toaster richColors position="bottom-right" />
			<main
				className={cn(
					"flex-1 flex flex-col min-h-0 overflow-hidden",
					pathname === "/" ? "" : "p-4 max-w-[960px] w-full mx-auto"
				)}
			>
				<Outlet />
			</main>
			{showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}
		</div>
	);
}

function ThemeToggle() {
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
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
		>
			{theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
		</Button>
	);
}
