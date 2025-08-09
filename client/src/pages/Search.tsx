import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorBlock from "../components/ErrorBlock";
import { api } from "../lib/api";

export default function Search() {
	const [q, setQ] = useState("");
	const [limit, setLimit] = useState(10);
	const [results, setResults] = useState<
		Array<{ id: string; title: string; similarity: number }>
	>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	async function run() {
		setLoading(true);
		setError(null);
		try {
			const data = await api<{
				query: string;
				results: Array<{ id: string; title: string; similarity: number }>;
			}>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`);
			setResults(data.results);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Search</h2>
			<div className="space-y-2">
				<Label htmlFor="search_query">Query</Label>
				<Input
					id="search_query"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Enter search query"
				/>
			</div>
			<div className="flex gap-2 items-center">
				<Label htmlFor="search_limit">Limit</Label>
				<Input
					id="search_limit"
					type="number"
					value={limit}
					onChange={(e) => setLimit(Number(e.target.value))}
					className="w-24"
				/>
				<Button onClick={run} disabled={loading || !q.trim()}>
					{loading ? "Searching..." : "Search"}
				</Button>
			</div>
			{error ? <ErrorBlock error={error} /> : null}
			<div className="grid gap-3">
				{results.map((r) => (
					<Card key={r.id}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="space-y-1">
								<CardTitle>
									<Link to={`/documents/${r.id}`} className="hover:underline">
										{r.title || r.id}
									</Link>
								</CardTitle>
								<div className="flex items-center gap-2">
									<Badge variant="secondary">
										Similarity: {r.similarity.toFixed(4)}
									</Badge>
								</div>
							</div>
							<Link to={`/documents/${r.id}`}>
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
