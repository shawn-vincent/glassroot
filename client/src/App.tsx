import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { MessageSquare, FileText, Search, Settings } from "lucide-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OfflineIndicator from "./components/OfflineIndicator";
import { Toaster } from "./components/ui/sonner";
import { useCapacitorKeyboard } from "@/hooks/useCapacitorKeyboard";
import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
	const { pathname } = useLocation();
	
	// Handle keyboard on Capacitor
	useCapacitorKeyboard();
	
	// Apply persisted theme at app mount to avoid mismatch
	useEffect(() => {
		const saved = localStorage.getItem("theme");
		const theme = saved === "dark" ? "dark" : "light";
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		
		// Removed complex platform and keyboard setup
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
				<div className="flex gap-2 items-center">
					<ThemeToggle />
				</div>
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
