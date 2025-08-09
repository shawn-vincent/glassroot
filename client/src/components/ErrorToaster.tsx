import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { onError } from "../lib/errors";

export default function ErrorToaster() {
	const [msg, setMsg] = useState<string | null>(null);
	useEffect(() => {
		let timer: number | undefined;
		const off = onError((m) => {
			setMsg(m);
			if (timer) window.clearTimeout(timer);
			timer = window.setTimeout(() => setMsg(null), 6000);
		});
		return () => {
			off();
			if (timer) window.clearTimeout(timer);
		};
	}, []);
	if (!msg) return null;
	return (
		<div className="fixed right-3 bottom-3 max-w-[420px] z-50">
			<div className="border border-error/30 bg-error/10 rounded-lg p-3">
				<div className="flex justify-between items-center gap-3">
					<div>
						<strong>Error:</strong> {msg}
					</div>
					<button
						type="button"
						onClick={() => setMsg(null)}
						className="p-1 border border-input-border rounded-md bg-transparent text-muted cursor-pointer transition-colors hover:text-foreground hover:border-accent"
					>
						<X size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}
