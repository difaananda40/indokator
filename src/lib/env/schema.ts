import { z } from "zod";

const envSchema = z.object({
	EXCHANGE_RATE_API_KEY: z.string().min(1),
	SERPAPI_KEY: z.string().min(1),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
	console.error(
		"Invalid environment variables:",
		z.treeifyError(_env.error).properties,
	);
	throw new Error("Invalid environment variables");
}

export const env = _env.data;
