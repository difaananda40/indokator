import { formatRupiah } from "../utils/currency";

export interface FuelProduct {
	product: string;
	price: string;
	type: string;
}

export interface RegionData {
	province: string;
	list_price: FuelProduct[];
}

const FUEL_PRODUCTS: Record<string, string> = {
	PERTALITE: "PERTALITE",
	PERTAMAX: "PERTAMAX",
	PERTAMAX_TURBO: "PERTAMAX TURBO",
	PERTAMINA_BIOSOLAR_SUBSIDI: "PERTAMINA BIOSOLAR SUBSIDI",
	DEXLITE: "DEXLITE",
	PERTAMINA_DEX: "PERTAMINA DEX",
};

export const FUEL_COLORS: Record<string, string> = {
	[FUEL_PRODUCTS.PERTALITE]: "#E1FFC9",
	[FUEL_PRODUCTS.PERTAMAX]: "#E6F4FF",
	[FUEL_PRODUCTS.PERTAMAX_TURBO]: "#FFC8C8",
	[FUEL_PRODUCTS.PERTAMINA_BIOSOLAR_SUBSIDI]: "#AEEBCC",
	[FUEL_PRODUCTS.DEXLITE]: "#D7D8D9",
	[FUEL_PRODUCTS.PERTAMINA_DEX]: "#83FFB2",
};

const FUEL_TYPES: Record<string, string> = {
	[FUEL_PRODUCTS.PERTALITE]: "RON 90",
	[FUEL_PRODUCTS.PERTAMAX]: "RON 92",
	[FUEL_PRODUCTS.PERTAMAX_TURBO]: "RON 98",
	[FUEL_PRODUCTS.PERTAMINA_BIOSOLAR_SUBSIDI]: "CN 48",
	[FUEL_PRODUCTS.DEXLITE]: "CN 51",
	[FUEL_PRODUCTS.PERTAMINA_DEX]: "CN 53",
};

const SORT_ORDER: Record<string, number> = {
	[FUEL_PRODUCTS.PERTALITE]: 1,
	[FUEL_PRODUCTS.PERTAMAX]: 2,
	[FUEL_PRODUCTS.PERTAMAX_TURBO]: 3,
	[FUEL_PRODUCTS.PERTAMINA_BIOSOLAR_SUBSIDI]: 4,
	[FUEL_PRODUCTS.DEXLITE]: 5,
	[FUEL_PRODUCTS.PERTAMINA_DEX]: 6,
};

export function getFuelColor(product: string): string {
	return FUEL_COLORS[product.toUpperCase()] || "#FFFFFF";
}

export async function getFuelPrices(): Promise<RegionData[]> {
	try {
		const response = await fetch("https://api.web.mypertamina.id/price");
		const json = await response.json();

		const allowedProducts = Object.values(FUEL_PRODUCTS);

		return json.data.data.map((region: RegionData) => ({
			province: region.province,
			list_price: region.list_price
				.filter((item: FuelProduct) =>
					allowedProducts.includes(item.product.toUpperCase()),
				)
				.map((item: FuelProduct) => {
					const rawPrice = parseInt(
						item.price.toString().replace(/Rp\s|\./g, ""),
					);
					const formattedPrice =
						rawPrice > 0 ? formatRupiah(rawPrice) : "Tidak Tersedia";
					return {
						product: item.product,
						price: formattedPrice,
						type: FUEL_TYPES[item.product.toUpperCase()] || "Lainnya",
					};
				})
				.sort((a: FuelProduct, b: FuelProduct) => {
					const orderA = SORT_ORDER[a.product.toUpperCase()] || 99;
					const orderB = SORT_ORDER[b.product.toUpperCase()] || 99;
					return orderA - orderB;
				}),
		}));
	} catch (error) {
		console.error("Failed to load data:", error);
		return [];
	}
}

export async function getGlobalFuelPrices(): Promise<RegionData> {
	const fuelPrices = await getFuelPrices();
	const globalFuelPrices = fuelPrices.find(
		(region) => region.province === "Prov. DKI Jakarta",
	);

	if (!globalFuelPrices) throw new Error("Global fuel prices not found");

	return globalFuelPrices;
}
