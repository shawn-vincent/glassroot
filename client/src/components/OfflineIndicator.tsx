import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflineIndicator() {
	const [online, setOnline] = useState(navigator.onLine);
	useEffect(() => {
		const on = () => setOnline(true);
		const off = () => setOnline(false);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);
	if (online) return null;
	return (
		<Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
			<WifiOff className="h-4 w-4" />
			<AlertDescription>
				You are offline. Network actions disabled.
			</AlertDescription>
		</Alert>
	);
}
