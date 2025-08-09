import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Copy } from "lucide-react";

type ErrorPayload = {
	message: string;
	status?: number;
	timestamp?: string;
	correlationId?: string;
	raw?: unknown;
};

type Props = { error: unknown };

export default function ErrorBlock({ error }: Props) {
	if (!error) return null;
	const data = normalizeError(error);
	return (
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription className="space-y-1">
				<div>{data.message}</div>
				{data.status && (
					<div className="text-sm opacity-80">Status: {data.status}</div>
				)}
				{data.timestamp && (
					<div className="text-sm opacity-80">Time: {data.timestamp}</div>
				)}
				{data.correlationId && (
					<div className="text-sm opacity-80">
						Correlation ID: {data.correlationId}
					</div>
				)}
				<div className="pt-2">
					<Button variant="outline" size="sm" onClick={() => copyDetails(data)}>
						<Copy className="mr-1.5 h-3 w-3" />
						Copy details
					</Button>
				</div>
			</AlertDescription>
		</Alert>
	);
}

function hasKey<T extends string>(
	obj: unknown,
	key: T,
): obj is Record<T, unknown> {
	return (
		typeof obj === "object" &&
		obj !== null &&
		key in (obj as Record<string, unknown>)
	);
}

function normalizeError(e: unknown): ErrorPayload {
	let payload: unknown = e;
	const response = hasKey(e, "response")
		? (e as Record<"response", unknown>).response
		: undefined;
	if (response && hasKey(response, "data"))
		payload = (response as Record<"data", unknown>).data;
	else if (hasKey(e, "data")) payload = (e as Record<"data", unknown>).data;
	if (payload && typeof payload === "object") {
		const rec = payload as Record<string, unknown>;
		return {
			message:
				typeof rec.error === "string"
					? rec.error
					: typeof rec.message === "string"
						? rec.message
						: "Unknown error",
			status: typeof rec.status === "number" ? rec.status : undefined,
			timestamp: typeof rec.timestamp === "string" ? rec.timestamp : undefined,
			correlationId:
				typeof rec.correlationId === "string" ? rec.correlationId : undefined,
			raw: payload,
		};
	}
	return { message: String(e), raw: e };
}

function copyDetails(d: ErrorPayload) {
	const redacted = redact(
		JSON.stringify(
			{
				message: d.message,
				status: d.status,
				timestamp: d.timestamp,
				correlationId: d.correlationId,
			},
			null,
			2,
		),
	);
	navigator.clipboard.writeText(redacted);
}

function redact(s: string) {
	return s.replace(/[A-Za-z0-9_\-]{20,}/g, "•••redacted•••");
}
