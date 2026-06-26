import passportData from "../data/passport.json";

export enum VisaStatus {
	VisaFree = "visa free",
	VisaOnArrival = "visa on arrival",
	VisaRequired = "visa required",
	EVisa = "e-visa",
	ETA = "eta",
	NoAdmission = "no admission",
}

interface RawDestination {
	status: string;
	days?: number | string;
}

interface RawPassportData {
	[countryCode: string]: {
		[destinationCode: string]: RawDestination;
	};
}

const typedPassportData = passportData as unknown as RawPassportData;

const countryOverrides: Record<string, string> = {
	KR: "Korea Selatan",
	KP: "Korea Utara",
	US: "Amerika Serikat",
	GB: "Inggris (UK)",
	TW: "Taiwan",
	RU: "Rusia",
};

export function getCountryName(
	countryCode: string,
	locale: string = "id",
): string {
	const code = countryCode.toUpperCase();
	if (locale === "id" && countryOverrides[code]) {
		return countryOverrides[code];
	}
	try {
		const regionNames = new Intl.DisplayNames([locale], { type: "region" });
		return regionNames.of(code) || code;
	} catch (error) {
		return code;
	}
}

export interface Destination {
	code: string;
	name: string;
	status: VisaStatus;
	days?: number | string;
}

export interface CountryPassport {
	code: string;
	name: string;
	vfScore: number;
	voaScore: number;
	etaScore: number;
	requiredScore: number;
	totalScore: number;
	rank: number;
	destinations: Destination[];
}

export interface GroupedRank {
	rank: number;
	totalScore: number;
	countries: CountryPassport[];
}

export function getRankedPassports(): CountryPassport[] {
	const calculated = Object.entries(typedPassportData).map(
		([originCode, destinationsObj]) => {
			const destinations: Destination[] = Object.entries(destinationsObj).map(
				([destCode, details]) => ({
					code: destCode,
					name: getCountryName(destCode),
					status: details.status as VisaStatus,
					days: details.days,
				}),
			);

			const vfScore = destinations.filter(
				(d) => d.status === VisaStatus.VisaFree,
			).length;
			const voaScore = destinations.filter(
				(d) => d.status === VisaStatus.VisaOnArrival,
			).length;
			const etaScore = destinations.filter(
				(d) => d.status === VisaStatus.ETA,
			).length;
			const eVisaScore = destinations.filter(
				(d) => d.status === VisaStatus.EVisa,
			).length;
			const visaRequiredScore = destinations.filter(
				(d) => d.status === VisaStatus.VisaRequired,
			).length;

			const totalScore = vfScore + voaScore + etaScore;
			const requiredScore = eVisaScore + visaRequiredScore;

			return {
				code: originCode,
				name: getCountryName(originCode),
				vfScore,
				voaScore,
				etaScore,
				requiredScore,
				totalScore,
				destinations,
			};
		},
	);

	calculated.sort((a, b) => b.totalScore - a.totalScore);

	let currentRank = 1;
	let previousScore = -1;

	return calculated.map((item, index) => {
		if (index > 0 && item.totalScore !== previousScore) {
			currentRank++;
		}
		previousScore = item.totalScore;
		return {
			...item,
			rank: currentRank,
		};
	});
}

export function getGroupedRankedPassports(): GroupedRank[] {
	const flatRanked = getRankedPassports();
	const grouped: GroupedRank[] = [];

	for (const item of flatRanked) {
		let currentGroup = grouped.find((g) => g.rank === item.rank);

		if (!currentGroup) {
			currentGroup = {
				rank: item.rank,
				totalScore: item.totalScore,
				countries: [],
			};
			grouped.push(currentGroup);
		}

		currentGroup.countries.push(item);
	}

	return grouped;
}

export function getPassport(countryCode: string): CountryPassport | undefined {
	const allRanked = getGroupedRankedPassports();
	return allRanked
		.flatMap((c) => c.countries)
		.find((c) => c.code === countryCode);
}
