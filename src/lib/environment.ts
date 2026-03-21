import {
	type AqiBand,
	getAqiMeta,
	getSafetyMeasuresForAqi,
} from "./air-quality";

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_ENDPOINT =
	"https://air-quality-api.open-meteo.com/v1/air-quality";

const WEATHER_CURRENT_FIELDS = [
	"temperature_2m",
	"relative_humidity_2m",
	"apparent_temperature",
	"wind_speed_10m",
	"wind_direction_10m",
	"wind_gusts_10m",
	"surface_pressure",
	"cloud_cover",
	"weather_code",
];

const WEATHER_HOURLY_FIELDS = [
	"temperature_2m",
	"relative_humidity_2m",
	"wind_speed_10m",
	"precipitation_probability",
];

const AIR_QUALITY_HOURLY_FIELDS = [
	"us_aqi",
	"pm2_5",
	"pm10",
	"nitrogen_dioxide",
	"ozone",
	"sulphur_dioxide",
	"dust",
];

const AIR_QUALITY_CURRENT_FIELDS = [
	"us_aqi",
	"european_aqi",
	"pm2_5",
	"pm10",
	"carbon_monoxide",
	"nitrogen_dioxide",
	"sulphur_dioxide",
	"ozone",
	"dust",
	"aerosol_optical_depth",
	"uv_index",
];

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const SNAPSHOT_CACHE_TTL_MS = 2 * 60 * 1000;

interface CacheEntry<T> {
	expiresAt: number;
	value: T;
}

const searchCache = new Map<string, CacheEntry<PlaceSearchResult[]>>();
const snapshotCache = new Map<string, CacheEntry<EnvironmentalSnapshot>>();

interface OpenMeteoGeocodingResult {
	id?: number;
	name: string;
	latitude: number;
	longitude: number;
	country?: string;
	admin1?: string;
	timezone?: string;
}

interface OpenMeteoGeocodingResponse {
	results?: OpenMeteoGeocodingResult[];
}

interface OpenMeteoUnitsPayload {
	temperature_2m?: string;
	relative_humidity_2m?: string;
	apparent_temperature?: string;
	wind_speed_10m?: string;
	wind_direction_10m?: string;
	wind_gusts_10m?: string;
	surface_pressure?: string;
	cloud_cover?: string;
	us_aqi?: string;
	european_aqi?: string;
	pm2_5?: string;
	pm10?: string;
	carbon_monoxide?: string;
	nitrogen_dioxide?: string;
	sulphur_dioxide?: string;
	ozone?: string;
	dust?: string;
	aerosol_optical_depth?: string;
	uv_index?: string;
}

interface OpenMeteoCurrentPayload {
	time?: string;
	temperature_2m?: number;
	relative_humidity_2m?: number;
	apparent_temperature?: number;
	wind_speed_10m?: number;
	wind_direction_10m?: number;
	wind_gusts_10m?: number;
	surface_pressure?: number;
	cloud_cover?: number;
	weather_code?: number;
	us_aqi?: number;
	european_aqi?: number;
	pm2_5?: number;
	pm10?: number;
	carbon_monoxide?: number;
	nitrogen_dioxide?: number;
	sulphur_dioxide?: number;
	ozone?: number;
	dust?: number;
	aerosol_optical_depth?: number;
	uv_index?: number;
}

interface OpenMeteoCurrentResponse {
	timezone?: string;
	current_units?: OpenMeteoUnitsPayload;
	current?: OpenMeteoCurrentPayload;
}

export interface PlaceSearchResult {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	country?: string;
	admin1?: string;
	timezone?: string;
	label: string;
}

export interface EnvironmentalSnapshot {
	label: string;
	latitude: number;
	longitude: number;
	timezone: string;
	updatedAt: string | null;
	aqi: number | null;
	usAqi: number | null;
	europeanAqi: number | null;
	aqiBand: AqiBand;
	aqiLabel: string;
	summary: string;
	safetyMeasures: string[];
	weatherLabel: string;
	temperature: number | null;
	apparentTemperature: number | null;
	humidity: number | null;
	windSpeed: number | null;
	windDirection: number | null;
	windGusts: number | null;
	pressure: number | null;
	cloudCover: number | null;
	uvIndex: number | null;
	pm25: number | null;
	pm10: number | null;
	carbonMonoxide: number | null;
	nitrogenDioxide: number | null;
	sulphurDioxide: number | null;
	ozone: number | null;
	dust: number | null;
	aerosolOpticalDepth: number | null;
	units: {
		temperature: string;
		humidity: string;
		apparentTemperature: string;
		windSpeed: string;
		windDirection: string;
		windGusts: string;
		pressure: string;
		cloudCover: string;
		uvIndex: string;
		pm25: string;
		pm10: string;
		carbonMonoxide: string;
		nitrogenDioxide: string;
		sulphurDioxide: string;
		ozone: string;
		dust: string;
		aerosolOpticalDepth: string;
	};
}

interface SnapshotInput {
	latitude: number;
	longitude: number;
	label: string;
	timezone?: string;
}

function getCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string) {
	const entry = cache.get(key);

	if (!entry) {
		return null;
	}

	if (entry.expiresAt < Date.now()) {
		cache.delete(key);
		return null;
	}

	return entry.value;
}

function setCachedValue<T>(
	cache: Map<string, CacheEntry<T>>,
	key: string,
	value: T,
	ttlMs: number,
) {
	cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function buildUrl(baseUrl: string, params: Record<string, string>) {
	const url = new URL(baseUrl);

	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.set(key, value);
	});

	return url.toString();
}

async function fetchJson<T>(url: string) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Open-Meteo request failed with ${response.status}`);
	}

	return (await response.json()) as T;
}

function formatLocationLabel(result: OpenMeteoGeocodingResult) {
	return [result.name, result.admin1, result.country]
		.filter(Boolean)
		.join(", ");
}

function describeWeatherCode(weatherCode: number | null | undefined) {
	switch (weatherCode) {
		case 0:
			return "Clear sky";
		case 1:
		case 2:
		case 3:
			return "Partly cloudy";
		case 45:
		case 48:
			return "Foggy conditions";
		case 51:
		case 53:
		case 55:
		case 56:
		case 57:
			return "Drizzle in the area";
		case 61:
		case 63:
		case 65:
		case 66:
		case 67:
			return "Rain nearby";
		case 71:
		case 73:
		case 75:
		case 77:
			return "Snow conditions";
		case 80:
		case 81:
		case 82:
			return "Rain showers nearby";
		case 85:
		case 86:
			return "Snow showers nearby";
		case 95:
		case 96:
		case 99:
			return "Thunderstorm risk";
		default:
			return "Mixed weather conditions";
	}
}

function toNumber(value: number | string | null | undefined) {
	if (value === null || value === undefined) return null;
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

export async function searchPlaces(
	query: string,
	count = 5,
): Promise<PlaceSearchResult[]> {
	const trimmedQuery = query.trim();

	if (trimmedQuery.length < 2) {
		return [];
	}

	const cacheKey = `${trimmedQuery.toLowerCase()}::${count}`;
	const cachedResults = getCachedValue(searchCache, cacheKey);

	if (cachedResults) {
		return cachedResults;
	}

	const url = buildUrl(GEOCODING_ENDPOINT, {
		name: trimmedQuery,
		count: String(count),
		language: "en",
		format: "json",
	});

	const data = await fetchJson<OpenMeteoGeocodingResponse>(url);
	const results = (data.results ?? []).map((result) => ({
		id: String(result.id ?? `${result.latitude},${result.longitude}`),
		name: result.name,
		latitude: result.latitude,
		longitude: result.longitude,
		country: result.country,
		admin1: result.admin1,
		timezone: result.timezone,
		label: formatLocationLabel(result),
	}));

	setCachedValue(searchCache, cacheKey, results, SEARCH_CACHE_TTL_MS);

	return results;
}

export async function fetchEnvironmentalSnapshot({
	latitude,
	longitude,
	label,
	timezone = "auto",
}: SnapshotInput): Promise<EnvironmentalSnapshot> {
	const cacheKey = `${latitude.toFixed(4)}::${longitude.toFixed(4)}::${timezone}::${label}`;
	const cachedSnapshot = getCachedValue(snapshotCache, cacheKey);

	if (cachedSnapshot) {
		return cachedSnapshot;
	}
	const weatherUrl = buildUrl(WEATHER_ENDPOINT, {
		latitude: String(latitude),
		longitude: String(longitude),
		current: WEATHER_CURRENT_FIELDS.join(","),
		wind_speed_unit: "kmh",
		timezone,
	});

	const airQualityUrl = buildUrl(AIR_QUALITY_ENDPOINT, {
		latitude: String(latitude),
		longitude: String(longitude),
		current: AIR_QUALITY_CURRENT_FIELDS.join(","),
		timezone,
	});

	const [weatherData, airQualityData] = await Promise.all([
		fetchJson<OpenMeteoCurrentResponse>(weatherUrl),
		fetchJson<OpenMeteoCurrentResponse>(airQualityUrl),
	]);

	const weatherCurrent = weatherData.current ?? {};
	const weatherUnits = weatherData.current_units ?? {};
	const airCurrent = airQualityData.current ?? {};
	const airUnits = airQualityData.current_units ?? {};
	const usAqi = toNumber(airCurrent.us_aqi);
	const europeanAqi = toNumber(airCurrent.european_aqi);
	const resolvedAqi = usAqi ?? europeanAqi;
	const aqiMeta = getAqiMeta(resolvedAqi ?? 0);
	const weatherLabel = describeWeatherCode(
		toNumber(weatherCurrent.weather_code),
	);
	const safetyMeasures =
		resolvedAqi != null
			? getSafetyMeasuresForAqi(resolvedAqi)
			: [
					"Check local advisories before prolonged outdoor activity.",
					"Prefer filtered indoor air if smoke, dust, or haze is visible.",
				];

	const snapshot: EnvironmentalSnapshot = {
		label,
		latitude,
		longitude,
		timezone: weatherData.timezone ?? airQualityData.timezone ?? timezone,
		updatedAt: weatherCurrent.time ?? airCurrent.time ?? null,
		aqi: resolvedAqi,
		usAqi,
		europeanAqi,
		aqiBand: aqiMeta.band,
		aqiLabel: resolvedAqi != null ? aqiMeta.label : "Live AQI unavailable",
		summary:
			resolvedAqi != null
				? `${aqiMeta.summary} ${weatherLabel}.`
				: `${weatherLabel}. AQI data is temporarily unavailable for this point.`,
		safetyMeasures,
		weatherLabel,
		temperature: toNumber(weatherCurrent.temperature_2m),
		apparentTemperature: toNumber(weatherCurrent.apparent_temperature),
		humidity: toNumber(weatherCurrent.relative_humidity_2m),
		windSpeed: toNumber(weatherCurrent.wind_speed_10m),
		windDirection: toNumber(weatherCurrent.wind_direction_10m),
		windGusts: toNumber(weatherCurrent.wind_gusts_10m),
		pressure: toNumber(weatherCurrent.surface_pressure),
		cloudCover: toNumber(weatherCurrent.cloud_cover),
		uvIndex: toNumber(airCurrent.uv_index),
		pm25: toNumber(airCurrent.pm2_5),
		pm10: toNumber(airCurrent.pm10),
		carbonMonoxide: toNumber(airCurrent.carbon_monoxide),
		nitrogenDioxide: toNumber(airCurrent.nitrogen_dioxide),
		sulphurDioxide: toNumber(airCurrent.sulphur_dioxide),
		ozone: toNumber(airCurrent.ozone),
		dust: toNumber(airCurrent.dust),
		aerosolOpticalDepth: toNumber(airCurrent.aerosol_optical_depth),
		units: {
			temperature: weatherUnits.temperature_2m ?? "degC",
			humidity: weatherUnits.relative_humidity_2m ?? "%",
			apparentTemperature: weatherUnits.apparent_temperature ?? "degC",
			windSpeed: weatherUnits.wind_speed_10m ?? "km/h",
			windDirection: weatherUnits.wind_direction_10m ?? "deg",
			windGusts: weatherUnits.wind_gusts_10m ?? "km/h",
			pressure: weatherUnits.surface_pressure ?? "hPa",
			cloudCover: weatherUnits.cloud_cover ?? "%",
			uvIndex: airUnits.uv_index ?? "",
			pm25: airUnits.pm2_5 ?? "",
			pm10: airUnits.pm10 ?? "",
			carbonMonoxide: airUnits.carbon_monoxide ?? "",
			nitrogenDioxide: airUnits.nitrogen_dioxide ?? "",
			sulphurDioxide: airUnits.sulphur_dioxide ?? "",
			ozone: airUnits.ozone ?? "",
			dust: airUnits.dust ?? "",
			aerosolOpticalDepth: airUnits.aerosol_optical_depth ?? "",
		},
	};

	setCachedValue(snapshotCache, cacheKey, snapshot, SNAPSHOT_CACHE_TTL_MS);

	return snapshot;
}

export interface WindGridPoint {
	latitude: number;
	longitude: number;
	speed: number;
	direction: number;
}

export interface WindGridData {
	points: WindGridPoint[];
	fetchedAt: number;
}

export interface HourlyForecast {
	time: string;
	aqi: number;
	pm25: number;
	temperature: number;
	windSpeed: number;
}

export interface AirQualityCalculations {
	dailyExposureDose: number;
	bestTimeToGoOut: { start: string; end: string; aqi: number } | null;
	trendPercent: number;
	dominantPollutant: string;
	healthScore: number;
	cityComparison: { percentBetter: number; cityAvgAqi: number };
}

export async function fetchHourlyForecast({
	latitude,
	longitude,
}: {
	latitude: number;
	longitude: number;
}): Promise<HourlyForecast[]> {
	const weatherUrl = buildUrl(WEATHER_ENDPOINT, {
		latitude: String(latitude),
		longitude: String(longitude),
		hourly: WEATHER_HOURLY_FIELDS.join(","),
		forecast_days: "1",
		timezone: "auto",
	});

	const airQualityUrl = buildUrl(AIR_QUALITY_ENDPOINT, {
		latitude: String(latitude),
		longitude: String(longitude),
		hourly: AIR_QUALITY_HOURLY_FIELDS.join(","),
		forecast_days: "1",
		timezone: "auto",
	});

	try {
		const [weatherData, airQualityData] = await Promise.all([
			fetchJson<{ hourly?: Record<string, (string | number)[]> }>(weatherUrl),
			fetchJson<{ hourly?: Record<string, (string | number)[]> }>(
				airQualityUrl,
			),
		]);

		const weatherHourly = weatherData.hourly;
		const airHourly = airQualityData.hourly;

		if (!weatherHourly || !airHourly) {
			return generateMockHourlyForecast();
		}

		const times = weatherHourly.time || airHourly.time || [];
		const forecasts: HourlyForecast[] = [];

		for (let i = 0; i < Math.min(times.length, 24); i++) {
			forecasts.push({
				time: String(times[i] ?? ""),
				aqi: toNumber(airHourly.us_aqi?.[i]) ?? 50,
				pm25: toNumber(airHourly.pm2_5?.[i]) ?? 15,
				temperature: toNumber(weatherHourly.temperature_2m?.[i]) ?? 20,
				windSpeed: toNumber(weatherHourly.wind_speed_10m?.[i]) ?? 5,
			});
		}

		return forecasts;
	} catch {
		return generateMockHourlyForecast();
	}
}

function generateMockHourlyForecast(): HourlyForecast[] {
	const now = new Date();
	const forecasts: HourlyForecast[] = [];

	for (let i = 0; i < 24; i++) {
		const hour = (now.getHours() + i) % 24;
		const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
		const baseAqi = isPeak ? 80 + Math.random() * 40 : 30 + Math.random() * 30;

		forecasts.push({
			time: new Date(now.getTime() + i * 60 * 60 * 1000).toISOString(),
			aqi: Math.round(baseAqi),
			pm25: Math.round(baseAqi * 0.4),
			temperature: 20 + Math.sin(((hour - 6) * Math.PI) / 12) * 8,
			windSpeed: 5 + Math.random() * 10,
		});
	}

	return forecasts;
}

export function calculateAirQualityMetrics(
	currentSnapshot: EnvironmentalSnapshot,
	hourlyForecast: HourlyForecast[],
	cityAvgAqi: number = 75,
): AirQualityCalculations {
	const pm25 = currentSnapshot.pm25 ?? 20;

	const dailyExposureDose = pm25 * 24 * 0.001;

	const cleanHours = hourlyForecast
		.filter((h) => h.aqi < 50)
		.sort((a, b) => a.aqi - b.aqi);

	let bestTime: { start: string; end: string; aqi: number } | null = null;
	if (cleanHours.length > 0) {
		const best = cleanHours[0];
		const time = new Date(best.time);
		bestTime = {
			start: time.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			end: new Date(time.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString(
				[],
				{ hour: "2-digit", minute: "2-digit" },
			),
			aqi: best.aqi,
		};
	}

	const trendPercent =
		cityAvgAqi > 0
			? Math.round(
					((cityAvgAqi - (currentSnapshot.aqi ?? 50)) / cityAvgAqi) * 100,
				)
			: 0;

	const dominantPollutant = getDominantPollutant(currentSnapshot);

	const healthScore = calculateHealthScore(currentSnapshot.aqi ?? 50, pm25);

	const percentBetter =
		cityAvgAqi > 0 && currentSnapshot.aqi
			? Math.round(((cityAvgAqi - currentSnapshot.aqi) / cityAvgAqi) * 100)
			: 0;

	return {
		dailyExposureDose: Math.round(dailyExposureDose * 1000) / 1000,
		bestTimeToGoOut: bestTime,
		trendPercent,
		dominantPollutant,
		healthScore,
		cityComparison: {
			percentBetter,
			cityAvgAqi,
		},
	};
}

function getDominantPollutant(snapshot: EnvironmentalSnapshot): string {
	const pollutants = [
		{
			name: "PM2.5 (Dust/Combustion)",
			value: snapshot.pm25 ?? 0,
			threshold: 35,
		},
		{ name: "PM10 (Coarse Dust)", value: snapshot.pm10 ?? 0, threshold: 50 },
		{
			name: "NO₂ (Vehicle Emissions)",
			value: snapshot.nitrogenDioxide ?? 0,
			threshold: 40,
		},
		{ name: "O₃ (Ground Ozone)", value: snapshot.ozone ?? 0, threshold: 100 },
		{
			name: "SO₂ (Industrial)",
			value: snapshot.sulphurDioxide ?? 0,
			threshold: 20,
		},
		{
			name: "CO (Combustion)",
			value: snapshot.carbonMonoxide ?? 0,
			threshold: 2,
		},
	];

	const ratios = pollutants.map((p) => ({
		...p,
		ratio: p.threshold > 0 ? p.value / p.threshold : 0,
	}));

	const dominant = ratios.reduce((max, curr) =>
		curr.ratio > max.ratio ? curr : max,
	);

	return dominant.name;
}

function calculateHealthScore(aqi: number, pm25: number): number {
	const aqiScore = Math.max(0, 100 - aqi);
	const pm25Score = Math.max(0, 100 - pm25 * 2);
	return Math.round(aqiScore * 0.6 + pm25Score * 0.4);
}

export async function fetchPlaceAqi(
	latitude: number,
	longitude: number,
): Promise<{ aqi: number | null; usAqi: number | null; band: AqiBand }> {
	try {
		const url = buildUrl(AIR_QUALITY_ENDPOINT, {
			latitude: String(latitude),
			longitude: String(longitude),
			current: "us_aqi,european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",
			timezone: "auto",
		});
		const data = await fetchJson<OpenMeteoCurrentResponse>(url);
		const airCurrent = data.current ?? {};
		const usAqi = toNumber(airCurrent.us_aqi);
		const resolvedAqi = usAqi ?? toNumber(airCurrent.european_aqi);
		const band = getAqiMeta(resolvedAqi ?? 0).band;
		return { aqi: resolvedAqi, usAqi, band };
	} catch {
		return { aqi: null, usAqi: null, band: "moderate" };
	}
}

export async function fetchPlaceFullSnapshot(
	latitude: number,
	longitude: number,
	label: string,
): Promise<EnvironmentalSnapshot> {
	return fetchEnvironmentalSnapshot({ latitude, longitude, label });
}

export async function fetchCityAqiAverage(cityName: string): Promise<number> {
	try {
		const results = await searchPlaces(cityName, 5);
		if (results.length === 0) return 75;

		const snapshots = await Promise.all(
			results.slice(0, 3).map((r) =>
				fetchEnvironmentalSnapshot({
					latitude: r.latitude,
					longitude: r.longitude,
					label: r.name,
				}),
			),
		);

		const validAqi = snapshots
			.map((s) => s.aqi)
			.filter((a): a is number => a !== null);

		if (validAqi.length === 0) return 75;

		return Math.round(validAqi.reduce((a, b) => a + b, 0) / validAqi.length);
	} catch {
		return 75;
	}
}

export async function fetchWindGrid({
	centerLat,
	centerLng,
	gridSize = 6,
}: {
	centerLat: number;
	centerLng: number;
	gridSize?: number;
}): Promise<WindGridData> {
	const points: WindGridPoint[] = [];
	const latStep = 0.015;
	const lngStep = 0.02;

	for (let i = 0; i < gridSize; i++) {
		for (let j = 0; j < gridSize; j++) {
			const lat =
				centerLat -
				(latStep * gridSize) / 2 +
				i * latStep +
				Math.random() * 0.005;
			const lng =
				centerLng -
				(lngStep * gridSize) / 2 +
				j * lngStep +
				Math.random() * 0.005;

			const url = buildUrl(WEATHER_ENDPOINT, {
				latitude: String(lat),
				longitude: String(lng),
				current: "wind_speed_10m,wind_direction_10m",
				wind_speed_unit: "kmh",
				timezone: "auto",
			});

			try {
				const data = await fetchJson<OpenMeteoCurrentResponse>(url);
				const current = data.current ?? {};
				points.push({
					latitude: lat,
					longitude: lng,
					speed: toNumber(current.wind_speed_10m) ?? 5,
					direction: toNumber(current.wind_direction_10m) ?? 180,
				});
			} catch {
				points.push({
					latitude: lat,
					longitude: lng,
					speed: 5 + Math.random() * 5,
					direction: 180 + Math.random() * 60,
				});
			}
		}
	}

	return {
		points,
		fetchedAt: Date.now(),
	};
}
