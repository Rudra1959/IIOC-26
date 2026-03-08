import { useState, useEffect, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { H3HexagonLayer } from '@deck.gl/geo-layers'
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers'
import { AmbientLight, PointLight, LightingEffect, FlyToInterpolator } from '@deck.gl/core'
import type { MapViewState } from '@deck.gl/core'
import { Map } from 'react-map-gl/maplibre'
import { latLngToCell } from 'h3-js'
import 'maplibre-gl/dist/maplibre-gl.css'

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 11,
  pitch: 55,
  bearing: -15,
}

const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 1.0 })
const pointLight = new PointLight({ color: [255, 200, 50], intensity: 2.5, position: [-122.4, 37.74, 8000] })
const lightingEffect = new LightingEffect({ ambientLight, pointLight })

interface GridCellData { id: string; score: number }

export interface RouteSegment {
  path: number[][]
  score: number
  color: [number, number, number]
}

// Generate realistic mock H3 grid data client-side (no API needed)
function generateMockGrid(): GridCellData[] {
  const cells: GridCellData[] = []
  const seen = new Set<string>()
  const centerLat = 37.74
  const centerLng = -122.4

  for (let i = 0; i < 300; i++) {
    const lat = centerLat + (Math.random() - 0.5) * 0.14
    const lng = centerLng + (Math.random() - 0.5) * 0.14
    const cellId = latLngToCell(lat, lng, 9)

    if (seen.has(cellId)) continue
    seen.add(cellId)

    const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2)
    const score = Math.max(5, Math.min(95, Math.round(40 + Math.random() * 45 - dist * 300)))
    cells.push({ id: cellId, score })
  }
  return cells
}

export function CityMap({ routeSegments, userLocation }: { routeSegments: RouteSegment[], userLocation: [number, number] | null }) {
  const [data, setData] = useState<GridCellData[]>([])
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)

  useEffect(() => {
    setData(generateMockGrid())
  }, [])

  useEffect(() => {
    if (userLocation) {
       setViewState({
         ...INITIAL_VIEW_STATE,
         longitude: userLocation[0],
         latitude: userLocation[1],
         zoom: 14,             // Deep zoom for hyper-local look
         transitionDuration: 3000,
         transitionInterpolator: new (FlyToInterpolator as any)(),
       })
    }
  }, [userLocation])

  const layers = useMemo(() => [
    new H3HexagonLayer<GridCellData>({
      id: 'h3-hexagon-layer',
      data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 50,
      coverage: 0.9,
      material: { ambient: 0.1, diffuse: 0.6, shininess: 32, specularColor: [60, 64, 70] },
      getHexagon: (d: GridCellData) => d.id,
      getFillColor: (d: GridCellData) => {
        const s = d.score
        if (s > 75) return [255, 50, 50, 220]
        if (s > 50) return [255, 165, 0, 200]
        if (s > 25) return [255, 220, 0, 170]
        return [50, 200, 80, 160]
      },
      getElevation: (d: GridCellData) => d.score * 10,
    }),
    new PathLayer<RouteSegment>({
      id: 'clean-route-layer',
      data: routeSegments,
      pickable: true,
      widthScale: 20,
      widthMinPixels: 4,
      capRounded: true,
      jointRounded: true,
      getPath: (d: RouteSegment) => d.path as any,
      getColor: (d: RouteSegment) => d.color,
      getWidth: () => 5,
    }),
    ...(userLocation ? [
      new ScatterplotLayer({
        id: 'user-location-pulse',
        data: [{ position: userLocation }],
        pickable: false,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 1,
        radiusMaxPixels: 1000,
        lineWidthMinPixels: 2,
        getPosition: (d: any) => d.position,
        getFillColor: [16, 185, 129, 60], // Emerald transparent
        getLineColor: [16, 185, 129, 255],
        getRadius: 300, // 300 meters
        transitions: {
          getRadius: {
            duration: 2000,
            type: 'spring',
            damping: 0.5,
            stiffness: 0.1
          }
        }
      }),
      new ScatterplotLayer({
        id: 'user-location-dot',
        data: [{ position: userLocation }],
        pickable: false,
        opacity: 1,
        filled: true,
        radiusMinPixels: 4,
        getPosition: (d: any) => d.position,
        getFillColor: [16, 185, 129, 255], 
        getRadius: 10,
      })
    ] : [])
  ], [data, routeSegments, userLocation])

  return (
    <div className="relative w-full h-full min-h-screen">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState as any)}
        controller={true}
        layers={layers}
        effects={[lightingEffect]}
        getTooltip={({ object }: any) =>
          object?.score != null
            ? {
                html: `<div style="background:#09090b;border:1px solid #27272a;padding:12px 16px;border-radius:12px;font-family:monospace;color:#fff">
                  <p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">Risk Score</p>
                  <p style="font-size:28px;font-weight:900;margin:0;color:${object.score > 75 ? '#ef4444' : object.score > 50 ? '#f97316' : '#22c55e'}">${Math.round(object.score)}</p>
                </div>`,
                style: { background: 'transparent', padding: '0', border: 'none' },
              }
            : null
        }
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>
    </div>
  )
}
