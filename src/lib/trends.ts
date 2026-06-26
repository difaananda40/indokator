import { env } from "@/lib/env/schema";

export interface Trend {
	topic: string;
	category: string;
}

export async function getTrendingTopics(): Promise<Trend[]> {
	try {
		const response = await fetch(
			`https://serpapi.com/search.json?engine=google_trends_trending_now&geo=ID&hours=5&hl=id&api_key=${env.SERPAPI_KEY}`,
		);
		const data = await response.json();

		return data.trending_searches
			.filter((item: any) => item.query && item.query.length > 2)
			.map((item: any) => ({
				topic: item.query,
				category: item.categories?.[0]?.name || "Trending",
			}))
			.slice(0, 8);
	} catch (error) {
		console.error("Failed to load trending topics:", error);
		return [{ topic: "Gagal memuat tren", category: "Error" }];
	}
}
