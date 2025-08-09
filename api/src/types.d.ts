export interface WorkersAI {
	run(model: string, input: unknown): Promise<unknown>;
}

export interface Env {
	DB: D1Database;
	VECTORS: VectorizeIndex;
	AI: WorkersAI; // Workers AI binding
	CORS_ORIGIN?: string;
}

export interface VectorizeIndex {
	upsert(
		items: Array<{
			id: string;
			values: number[];
			metadata?: Record<string, unknown>;
		}>,
	): Promise<unknown>;
	query(
		vector: number[],
		options: { topK: number; returnValues?: boolean; returnMetadata?: boolean },
	): Promise<{
		matches: Array<{
			id: string;
			score: number;
			metadata?: Record<string, unknown>;
		}>;
	}>;
}
