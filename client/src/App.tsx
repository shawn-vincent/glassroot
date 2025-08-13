import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { MessageSquare, FileText, Search, Settings } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OfflineIndicator from "./components/OfflineIndicator";
import { Toaster } from "./components/ui/sonner";
import { useCapacitorKeyboard } from "@/hooks/useCapacitorKeyboard";
import { applyAccentColor, type AccentColor } from "@/lib/theme-colors";

export default function App() {
	const { pathname } = useLocation();
	
	// Handle keyboard on Capacitor
	useCapacitorKeyboard();
	
	// Apply persisted theme and accent color at app mount
	useEffect(() => {
		// Apply theme
		const savedTheme = localStorage.getItem("theme");
		const isDark = savedTheme === "dark";
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		
		// Apply user accent color using CSS variables directly
		const savedAccent = (localStorage.getItem("user_accent_color") || "blue") as AccentColor;
		applyAccentColor(savedAccent, isDark);
	}, []);
	return (
		<div className="h-full flex flex-col">
			<header className="flex-shrink-0 flex items-center justify-between px-4 py-3 md:py-3 border-b border-[var(--border)] bg-background z-10 pt-safe">
				<nav className="flex gap-2">
					<Link to="/" title="Chat">
						<IconButton selected={pathname === "/"}>
							<MessageSquare size={24} />
						</IconButton>
					</Link>
					<Link to="/documents" title="Documents">
						<IconButton selected={pathname.startsWith("/documents")}>
							<FileText size={24} />
						</IconButton>
					</Link>
					<Link to="/search" title="Search">
						<IconButton selected={pathname.startsWith("/search")}>
							<Search size={24} />
						</IconButton>
					</Link>
					<Link to="/settings" title="Settings">
						<IconButton selected={pathname.startsWith("/settings")}>
							<Settings size={24} />
						</IconButton>
					</Link>
				</nav>
			</header>
			<OfflineIndicator />
			<Toaster richColors position="bottom-right" />
			<main
				className={cn(
					"flex-1 flex flex-col min-h-0 overflow-hidden",
					pathname === "/" ? "" : pathname === "/settings" ? "" : "p-4 max-w-[960px] w-full mx-auto"
				)}
			>
				<Outlet />
			</main>
		</div>
	);
}
