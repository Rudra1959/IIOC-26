import { create } from 'zustand'

interface Source {
  score: number
  attributedSource: string
  aqi: number
  isIdlingRisk: boolean
}

interface EnvState {
  userLocation: [number, number] | null
  setUserLocation: (location: [number, number]) => void
  cityAverageUHI: number
  identifiedSources: Source[]
  setInsights: (data: { cityAverageUHI: number; identifiedSources: Source[] }) => void
}

export const useEnvStore = create<EnvState>((set) => ({
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),
  cityAverageUHI: 25,
  identifiedSources: [],
  setInsights: (data) =>
    set({
      cityAverageUHI: data.cityAverageUHI,
      identifiedSources: data.identifiedSources,
    }),
}))
