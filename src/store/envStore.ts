import { create } from 'zustand'

interface Source {
  score: number
  attributedSource: string
  aqi: number
  isIdlingRisk: boolean
}

interface EnvState {
  cityAverageUHI: number
  identifiedSources: Source[]
  setInsights: (data: { cityAverageUHI: number; identifiedSources: Source[] }) => void
}

export const useEnvStore = create<EnvState>((set) => ({
  cityAverageUHI: 25,
  identifiedSources: [],
  setInsights: (data) =>
    set({
      cityAverageUHI: data.cityAverageUHI,
      identifiedSources: data.identifiedSources,
    }),
}))
