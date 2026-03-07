import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useEnvStore } from '#/store/envStore'

// Mock intelligence data — no API needed
const MOCK_SOURCES = [
  { score: 88, attributedSource: 'Vehicle Idling / Traffic Emissions', aqi: 142, isIdlingRisk: true },
  { score: 76, attributedSource: 'Urban Heat Island Effect', aqi: 98, isIdlingRisk: false },
  { score: 64, attributedSource: 'Industrial Biomass Combustion', aqi: 85, isIdlingRisk: false },
]

export function GovView() {
  const { identifiedSources, setInsights } = useEnvStore()

  useEffect(() => {
    // Load mock data on mount
    setInsights({ cityAverageUHI: 25, identifiedSources: MOCK_SOURCES })
  }, [setInsights])

  if (!identifiedSources.length) return null

  const highestRisk = identifiedSources[0]?.score || 0
  let actionRequired = ''
  let actionColor = 'text-green-400'

  if (highestRisk > 85) {
    actionRequired = 'Traffic diversion + Construction halt'
    actionColor = 'text-red-500'
  } else if (highestRisk > 70) {
    actionRequired = 'Deploy water sprinklers in High-Risk Grids'
    actionColor = 'text-orange-500'
  } else if (highestRisk > 60) {
    actionRequired = 'Increase street sweeping frequency'
    actionColor = 'text-yellow-400'
  } else {
    actionRequired = 'Standard monitoring active'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="pointer-events-auto absolute top-20 right-4 w-80 sm:w-96 bg-[#09090b]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-2xl text-white"
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Command Center</h3>
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      </div>

      <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Automated Action Matrix</h4>
        <p className={`text-sm font-medium ${actionColor}`}>{actionRequired}</p>
        {highestRisk > 85 && (
          <p className="mt-2 text-xs text-red-400 animate-pulse">Push Notification Dispatched: &quot;Hazard Detected.&quot;</p>
        )}
      </div>

      <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Live Threat Attribution</h4>
      <div className="space-y-2.5">
        {identifiedSources.slice(0, 3).map((source: any, i: number) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-400 font-medium mb-0.5">Risk {Math.round(source.score)}</p>
                <h4 className="text-sm font-bold truncate">{source.attributedSource}</h4>
              </div>
              <div className="text-right ml-2">
                <p className="text-xs text-gray-400">AQI</p>
                <p className="text-sm font-bold">{Math.round(source.aqi || 0)}</p>
              </div>
            </div>
            {source.isIdlingRisk && (
              <div className="mt-2 text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 px-2 py-1 rounded inline-block">
                Traffic Idling Detected
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
