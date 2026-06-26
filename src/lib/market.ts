import { formatRupiah } from "../utils/currency";
import { env } from "@/lib/env/schema";

export interface ExchangeRates {
	usd: string;
	myr: string;
}

export async function getExchangeRates(): Promise<ExchangeRates> {
	try {
		const response = await fetch(
			`https://v6.exchangerate-api.com/v6/${env.EXCHANGE_RATE_API_KEY}/latest/IDR`,
		);
		const data = await response.json();

		const usdRate = formatRupiah(1 / data.conversion_rates.USD);
		const myrRate = formatRupiah(1 / data.conversion_rates.MYR);

		return {
			usd: usdRate,
			myr: myrRate,
		};
	} catch (error) {
		console.error("Failed to load exchange rates:", error);
		return {
			usd: "Rp 0",
			myr: "Rp 0",
		};
	}
}

export async function getGoldPrice(): Promise<{ buy: string; sell: string }> {
	try {
		const response = await fetch("https://pegadaian.co.id/gold/prices");
		const data = await response.json();

		// Pegadaian price is for 0.01g, so multiply by 100 for 1g
		const buyPricePerGram = data.data.hargaBeli * 100;
		const sellPricePerGram = data.data.hargaJual * 100;

		return {
			buy: formatRupiah(buyPricePerGram),
			sell: formatRupiah(sellPricePerGram),
		};
	} catch (error) {
		console.error("Failed to load gold price:", error);
		return {
			buy: "Rp 0",
			sell: "Rp 0",
		};
	}
}
