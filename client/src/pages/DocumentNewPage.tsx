import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import ErrorBlock from "../components/ErrorBlock";
import { api } from "../lib/api";
import { FilePlus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

const Schema = z.object({
	title: z.string().trim().min(1),
	content: z.string().trim().min(1),
});

export default function DocumentNewPage() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<unknown>(null);
	const [loading, setLoading] = useState(false);
	const nav = useNavigate();

	async function create() {
		setError(null);
		const parsed = Schema.safeParse({ title, content });
		if (!parsed.success) {
			setError(parsed.error);
			return;
		}
		setLoading(true);
		try {
			const res = await api<{ id: string; title: string; content: string }>(
				"/api/documents",
				{
					method: "POST",
					body: JSON.stringify(parsed.data),
				},
			);
			nav(`/documents/${res.id}`);
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<PageLayout
			title="New Document"
			description="Create a new document"
			icon={FilePlus}
		>
			<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="doc_title">Title</Label>
				<Input
					id="doc_title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter document title"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="doc_content">Content</Label>
				<Textarea
					id="doc_content"
					rows={12}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Enter document content"
				/>
			</div>
			<div className="flex gap-2">
				<Button disabled={loading} onClick={create}>
					{loading ? "Creating..." : "Create Document"}
				</Button>
			</div>
			{error ? <ErrorBlock error={error} /> : null}
			</div>
		</PageLayout>
	);
}
