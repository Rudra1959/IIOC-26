import { useState, useEffect, useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers'
import { AmbientLight, PointLight, LightingEffect, FlyToInterpolator } from '@deck.gl/core'
import type { MapViewState } from '@deck.gl/core'
import { Map } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEnvStore } from '../../store/envStore'

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

interface ImpactData {
  id: string
  position: [number, number]
  score: number
}

export interface RouteSegment {
  path: number[][]
  score: number
  color: [number, number, number]
}

function generateLocalImpactData(centerLat: number, centerLng: number): ImpactData[] {
  const points: ImpactData[] = []
  for (let i = 0; i < 60; i++) {
    const lat = centerLat + (Math.random() - 0.5) * 0.03
    const lng = centerLng + (Math.random() - 0.5) * 0.03
    
    // Closer to center = better/different score
    const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2)
    const score = Math.max(5, Math.min(95, Math.round(40 + Math.random() * 45 - dist * 1500)))
    
    points.push({
      id: `impact-${i}`,
      position: [lng, lat],
      score
    })
  }
  return points
}

export function CityMap({ routeSegments, userLocation }: { routeSegments: RouteSegment[], userLocation: [number, number] | null }) {
  const [data, setData] = useState<ImpactData[]>([])
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE)
  
  const greenDestination = useEnvStore(s => s.greenDestination)

  useEffect(() => {
    if (userLocation) {
       setData(generateLocalImpactData(userLocation[1], userLocation[0]))
    } else {
       setData(generateLocalImpactData(37.74, -122.4))
    }
  }, [userLocation])

  useEffect(() => {
    if (userLocation && !greenDestination) {
       setViewState({
         ...INITIAL_VIEW_STATE,
         longitude: userLocation[0],
         latitude: userLocation[1],
         zoom: 14,             // Deep zoom for hyper-local look
         transitionDuration: 3000,
         transitionInterpolator: new (FlyToInterpolator as any)(),
       })
    }
  }, [userLocation, greenDestination])

  useEffect(() => {
      if (greenDestination) {
        setViewState({
            ...INITIAL_VIEW_STATE,
            longitude: greenDestination[0],
            latitude: greenDestination[1],
            zoom: 15,
            pitch: 60,
            transitionDuration: 4000,
            transitionInterpolator: new (FlyToInterpolator as any)(),
        })
      }
  }, [greenDestination])

  const layers = useMemo(() => [
    new ScatterplotLayer<ImpactData>({
      id: 'impact-circles-layer',
      data,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 5,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 2,
      getPosition: d => d.position,
      getFillColor: d => {
        const s = d.score
        if (s > 75) return [255, 50, 50, 200]
        if (s > 50) return [255, 165, 0, 180]
        if (s > 25) return [255, 220, 0, 150]
        return [50, 200, 80, 150]
      },
      getLineColor: [255, 255, 255, 60],
      getRadius: 150, // 150 meters radius
      transitions: {
        getRadius: { duration: 1000, type: 'spring' },
        getFillColor: { duration: 1000 }
      }
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
    ] : []),
    ...(greenDestination ? [
      new ScatterplotLayer({
        id: 'green-destination-marker',
        data: [{ position: greenDestination }],
        pickable: true,
        opacity: 1,
        stroked: true,
        filled: true,
        radiusScale: 1,
        radiusMinPixels: 8,
        radiusMaxPixels: 100,
        lineWidthMinPixels: 3,
        getPosition: (d: any) => d.position,
        getFillColor: [16, 185, 129, 255],
        getLineColor: [255, 255, 255, 255],
        getRadius: 80,
      }),
      new ScatterplotLayer({
        id: 'green-destination-pulse',
        data: [{ position: greenDestination }],
        pickable: false,
        opacity: 0.4,
        filled: true,
        getPosition: (d: any) => d.position,
        getFillColor: [16, 185, 129, 100], 
        getRadius: 400,
        transitions: {
          getRadius: {
            duration: 2000,
            type: 'spring',
            damping: 0.5,
            stiffness: 0.1
          }
        }
      })
    ] : [])
  ], [data, routeSegments, userLocation, greenDestination])

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
                  <p style="font-size:10px;color:#71717a;margin:0 0 4px;text-transform:uppercase;">Impact Metric</p>
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
