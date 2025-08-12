import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ErrorBlock from "../components/ErrorBlock";
import { api } from "../lib/api";
import { FileText } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

type DocRow = {
	id: string;
	title: string;
	content: string;
	vector_id: string;
	created: number;
};

export default function DocumentViewPage() {
	const { id = "" } = useParams();
	const { data, isLoading, error } = useQuery<DocRow>({
		queryKey: ["document", id],
		queryFn: () => api<DocRow>(`/api/documents/${id}`),
	});
	return (
		<PageLayout
			title={data?.title || "Document"}
			description="View and manage document"
			icon={FileText}
		>
			<div className="space-y-4">
				{isLoading && <div className="text-muted-foreground">Loading…</div>}
				{error && <ErrorBlock error={error} />}
			{data && (
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">{data.title}</CardTitle>
						<CardDescription>
							Created {new Date((data.created || 0) * 1000).toLocaleString()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="whitespace-pre-wrap">{data.content}</div>
					</CardContent>
				</Card>
			)}
			</div>
		</PageLayout>
	);
}
