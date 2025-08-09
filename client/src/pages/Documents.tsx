import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ErrorBlock from "../components/ErrorBlock";
import { api } from "../lib/api";

export default function Documents() {
	const { data, error, isLoading, isStale, dataUpdatedAt } = useQuery({
		queryKey: ["documents"],
		queryFn: () =>
			api<{ documents: { id: string; title: string; created: number }[] }>(
				"/api/documents",
			),
		staleTime: 60_000,
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div />
				<Link to="/documents/new">
					<Button>New Document</Button>
				</Link>
			</div>
			<div className="flex items-center justify-between">
				{isLoading ? (
					<div className="text-muted-foreground">Loading…</div>
				) : (
					<div className="text-sm text-muted-foreground">
						Last updated{" "}
						{dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "—"}{" "}
						{isStale && "(stale)"}
					</div>
				)}
				<Button variant="outline" onClick={() => window.location.reload()}>
					Refresh
				</Button>
			</div>
			{error && <ErrorBlock error={error} />}
			<div className="grid gap-3">
				{data?.documents?.map((d) => (
					<Card key={d.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="space-y-1">
								<CardTitle>
									<Link to={`/documents/${d.id}`} className="hover:underline">
										{d.title}
									</Link>
								</CardTitle>
								<CardDescription>
									Created {new Date((d.created || 0) * 1000).toLocaleString()}
								</CardDescription>
							</div>
							<Link to={`/documents/${d.id}`}>
								<Button variant="secondary" size="sm">
									Open
								</Button>
							</Link>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
