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

function toNumber(value: number | null | undefined) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
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
