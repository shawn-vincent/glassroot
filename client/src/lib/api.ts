const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	try {
		const res = await fetch(API_BASE + path, {
			headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
			...init,
		});
		const ct = res.headers.get("content-type") || "";
		const data = ct.includes("application/json")
			? await res.json()
			: await res.text();
		if (!res.ok) {
			throw { response: { status: res.status, data, json: async () => data } };
		}
		return data;
	} catch (e: unknown) {
		let message = "Network error";
		if (e && typeof e === "object" && "message" in e) {
			const m = (e as Record<string, unknown>).message;
			message = typeof m === "string" ? m : "Network error";
		}
		const data = {
			error: `Network error: ${message}`,
			status: 0,
			timestamp: new Date().toISOString(),
		};
		throw { response: { status: 0, data, json: async () => data } };
	}
}

export type Doc = {
	id: string;
	title: string;
	content?: string;
	created?: number;
};
