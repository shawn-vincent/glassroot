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
		<div className="bg-warning/10 border border-warning/30 text-warning px-3 py-2 text-center">
			You are offline. Network actions disabled.
		</div>
	);
}
