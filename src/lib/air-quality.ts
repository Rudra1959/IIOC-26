export type AqiBand =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'

export interface AqiLookupResult {
  place: string
  aqi: number
  band: AqiBand
  label: string
  summary: string
  safetyMeasures: string[]
  coordinates: [number, number] | null
}

export interface CleanZoneDestination {
  coordinates: [number, number]
  name: string
  distanceKm: number
  note: string
}

interface PlaceSeed {
  name: string
  aliases?: string[]
  aqi: number
  coordinates: [number, number]
}

const KNOWN_PLACES: PlaceSeed[] = [
  { name: 'New Delhi', aliases: ['delhi'], aqi: 176, coordinates: [77.1025, 28.7041] },
  { name: 'Mumbai', aliases: ['bombay'], aqi: 119, coordinates: [72.8777, 19.076] },
  { name: 'Bengaluru', aliases: ['bangalore'], aqi: 92, coordinates: [77.5946, 12.9716] },
  { name: 'Kolkata', aliases: ['calcutta'], aqi: 134, coordinates: [88.3639, 22.5726] },
  { name: 'Chennai', aliases: ['madras'], aqi: 88, coordinates: [80.2707, 13.0827] },
  { name: 'Hyderabad', aqi: 101, coordinates: [78.4867, 17.385] },
  { name: 'San Francisco', aliases: ['sf'], aqi: 58, coordinates: [-122.4194, 37.7749] },
  { name: 'New York', aliases: ['nyc'], aqi: 64, coordinates: [-74.006, 40.7128] },
  { name: 'Los Angeles', aliases: ['la'], aqi: 97, coordinates: [-118.2437, 34.0522] },
  { name: 'London', aqi: 56, coordinates: [-0.1276, 51.5072] },
  { name: 'Paris', aqi: 53, coordinates: [2.3522, 48.8566] },
  { name: 'Singapore', aqi: 67, coordinates: [103.8198, 1.3521] },
  { name: 'Tokyo', aqi: 49, coordinates: [139.6917, 35.6895] },
]

const CLEAN_ZONE_TEMPLATES = [
  { name: 'Botanical Garden Refuge', offset: [-0.012, 0.009] as [number, number], note: 'Dense canopy and low roadside exposure.' },
  { name: 'Lakeside Fresh Air Loop', offset: [0.01, -0.006] as [number, number], note: 'Open breezeways help disperse trapped pollutants.' },
  { name: 'Riverside Green Corridor', offset: [-0.016, 0.004] as [number, number], note: 'Tree cover and limited traffic create a cleaner pocket.' },
  { name: 'Community Eco Park', offset: [0.007, 0.013] as [number, number], note: 'Vegetation buffers and pedestrian-only access reduce exposure.' },
]

function normalizePlace(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function formatPlaceName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function getAqiMeta(aqi: number): Pick<AqiLookupResult, 'band' | 'label' | 'summary'> {
  if (aqi <= 50) {
    return {
      band: 'good',
      label: 'Good',
      summary: 'Air quality is comfortable for normal outdoor activity.',
    }
  }

  if (aqi <= 100) {
    return {
      band: 'moderate',
      label: 'Moderate',
      summary: 'Most people are fine outdoors, but sensitive groups should monitor symptoms.',
    }
  }

  if (aqi <= 150) {
    return {
      band: 'unhealthy-sensitive',
      label: 'Unhealthy for sensitive groups',
      summary: 'Children, older adults, and people with asthma should limit sustained exertion.',
    }
  }

  if (aqi <= 200) {
    return {
      band: 'unhealthy',
      label: 'Unhealthy',
      summary: 'Outdoor exposure should be reduced, especially during peak heat and traffic hours.',
    }
  }

  if (aqi <= 300) {
    return {
      band: 'very-unhealthy',
      label: 'Very unhealthy',
      summary: 'Health effects become more likely for everyone and outdoor time should stay brief.',
    }
  }

  return {
    band: 'hazardous',
    label: 'Hazardous',
    summary: 'Avoid outdoor activity and move to filtered indoor air if possible.',
  }
}

export function getSafetyMeasuresForAqi(aqi: number) {
  const measures = [
    'Keep windows closed during high-traffic hours and use a fan or air purifier indoors.',
    'Carry water and reduce strenuous exercise until the air clears.',
  ]

  if (aqi > 100) {
    measures.unshift('Wear a well-fitted mask if you need to be outside for more than a few minutes.')
  }

  if (aqi > 150) {
    measures.push('Choose tree-lined or indoor routes instead of roadside walking corridors.')
  }

  if (aqi > 200) {
    measures.push('Check on children, older adults, and anyone with asthma or breathing difficulty.')
  }

  return measures.slice(0, 4)
}

function hashValue(value: string) {
  let hash = 0

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100000
  }

  return hash
}

export function lookupPlaceAqi(query: string): AqiLookupResult | null {
  const normalized = normalizePlace(query)

  if (!normalized) {
    return null
  }

  const knownPlace = KNOWN_PLACES.find((place) => {
    const searchableNames = [place.name, ...(place.aliases ?? [])].map(normalizePlace)
    return searchableNames.some(
      (entry) => entry === normalized || entry.includes(normalized) || normalized.includes(entry),
    )
  })

  const aqi = knownPlace ? knownPlace.aqi : 35 + (hashValue(normalized) % 185)
  const meta = getAqiMeta(aqi)
  const place = knownPlace?.name ?? formatPlaceName(query)

  return {
    place,
    aqi,
    band: meta.band,
    label: meta.label,
    summary: meta.summary,
    safetyMeasures: getSafetyMeasuresForAqi(aqi),
    coordinates: knownPlace?.coordinates ?? null,
  }
}

function getDistanceKm(from: [number, number], to: [number, number]) {
  const [fromLng, fromLat] = from
  const [toLng, toLat] = to
  const earthRadiusKm = 6371
  const dLat = ((toLat - fromLat) * Math.PI) / 180
  const dLng = ((toLng - fromLng) * Math.PI) / 180
  const startLat = (fromLat * Math.PI) / 180
  const endLat = (toLat * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getNearestCleanZone(userLocation: [number, number]): CleanZoneDestination {
  const candidates = CLEAN_ZONE_TEMPLATES.map((template) => {
    const coordinates: [number, number] = [
      userLocation[0] + template.offset[0],
      userLocation[1] + template.offset[1],
    ]

    return {
      coordinates,
      name: template.name,
      note: template.note,
      distanceKm: getDistanceKm(userLocation, coordinates),
    }
  })

  return candidates.reduce((closest, candidate) =>
    candidate.distanceKm < closest.distanceKm ? candidate : closest,
  )
}
