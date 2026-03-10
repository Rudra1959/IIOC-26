import { MapPin, Wind, Info, Droplets, Sun, Activity, ChevronRight, X, Play, Square, Star, Shield, Map as MapIcon, CheckCircle2, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useEnvStore } from '../../store/envStore'
import { Input } from '../ui/input'
import { getNearestCleanZone, getSafetyMeasuresForAqi, lookupPlaceAqi, type AqiBand } from '../../lib/air-quality'

const aqiBandStyles: Record<AqiBand, { text: string; badge: string }> = {
  good: {
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  },
  moderate: {
    text: 'text-yellow-300',
    badge: 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/30',
  },
  'unhealthy-sensitive': {
    text: 'text-orange-300',
    badge: 'bg-orange-500/15 text-orange-200 border border-orange-500/30',
  },
  unhealthy: {
    text: 'text-red-400',
    badge: 'bg-red-500/15 text-red-300 border border-red-500/30',
  },
  'very-unhealthy': {
    text: 'text-fuchsia-300',
    badge: 'bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/30',
  },
  hazardous: {
    text: 'text-rose-300',
    badge: 'bg-rose-500/15 text-rose-200 border border-rose-500/30',
  },
}

export function CitizenView() {
  const { user } = useUser()
  const dbUser = useQuery(api.users.getByClerkId, user ? { clerkId: user.id } : 'skip')
  const completeCleanup = useMutation(api.cleanups.completeCleanup)
  const submitSurvey = useMutation(api.cleanups.submitSurvey)

  const userLocation = useEnvStore((s) => s.userLocation)
  const greenDestination = useEnvStore((s) => s.greenDestination)
  const setGreenDestination = useEnvStore((s) => s.setGreenDestination)

  const score = 84
  const [activeMetric, setActiveMetric] = useState<string | null>(null)
  const [placeQuery, setPlaceQuery] = useState('')
  const [aqiLookup, setAqiLookup] = useState<ReturnType<typeof lookupPlaceAqi>>(null)
  const [aqiLookupError, setAqiLookupError] = useState('')

  const [isCleaning, setIsCleaning] = useState(false)
  const [showPulseCheck, setShowPulseCheck] = useState(false)
  const [cleanupId, setCleanupId] = useState<string | null>(null)

  const [questions, setQuestions] = useState({ safety: 5, accuracy: 5, comments: '' })

  const metrics = useMemo(
    () => [
      { id: 'aqi', title: 'Air Quality (AQI)', value: score, unit: '', icon: Wind, color: 'text-red-500', bg: 'bg-red-500/10' },
      { id: 'humidity', title: 'Humidity', value: 68, unit: '%', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { id: 'uv', title: 'UV Index', value: 8, unit: 'High', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      { id: 'pollen', title: 'Pollen Count', value: 120, unit: 'High', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ],
    [score],
  )

  const localSafetyMeasures = useMemo(() => getSafetyMeasuresForAqi(score), [score])

  const handlePlaceLookup = () => {
    const result = lookupPlaceAqi(placeQuery)

    if (!result) {
      setAqiLookup(null)
      setAqiLookupError('Enter a place name to check its AQI.')
      return
    }

    setAqiLookup(result)
    setAqiLookupError('')
  }

  const handleNearestCleanZone = () => {
    if (!userLocation) {
      return
    }

    setGreenDestination(getNearestCleanZone(userLocation))
  }

  const highlightedCleanZone = greenDestination?.name ?? 'City Green Belt'
  const highlightedCleanZoneDistance = greenDestination?.distanceKm.toFixed(1) ?? '1.2'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-auto absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-[#09090b]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white overflow-hidden"
      >
        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-white/5 to-transparent blur-2xl pointer-events-none" />

        {dbUser && (
          <div className="flex items-center justify-between mb-6 relative z-10 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Eco-Warrior Level {dbUser.level || 1}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Star className="w-3 h-3 text-amber-400" />
                <span>{dbUser.xp || 0} XP | {dbUser.badges?.[(dbUser.badges?.length ?? 1) - 1] || 'Scout'}</span>
              </div>
            </div>

            {!isCleaning ? (
              <button
                onClick={() => setIsCleaning(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3" />
                Start Mission
              </button>
            ) : (
              <button
                onClick={async () => {
                  setIsCleaning(false)
                  if (user && userLocation) {
                    const id = await completeCleanup({
                      clerkId: user.id,
                      lat: userLocation[1],
                      lng: userLocation[0],
                      xpAwarded: 50,
                    })
                    setCleanupId(id as string)
                    setShowPulseCheck(true)
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all animate-pulse cursor-pointer"
              >
                <Square className="w-3 h-3" />
                End Mission
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white shadow-lg shadow-red-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Local Environment</h2>
              <p className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                Hyper-local view | +/- 500m precision
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 cursor-pointer">
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          {metrics.map((metric) => (
            <motion.button
              key={metric.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMetric(metric.id)}
              className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg ${metric.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <p className="text-xs text-zinc-400 font-medium mb-1">{metric.title}</p>
              <div className="flex items-end gap-1">
                <span className={`text-2xl font-black ${metric.color} tracking-tight`}>{metric.value}</span>
                <span className="text-sm font-bold text-zinc-500 mb-0.5">{metric.unit}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-white">Search AQI for any place</p>
              <p className="text-xs text-zinc-400">Try a city, district, or landmark name.</p>
            </div>
            <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          <div className="flex gap-2">
            <Input
              value={placeQuery}
              onChange={(event) => setPlaceQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handlePlaceLookup()
                }
              }}
              placeholder="Search place AQI"
              className="h-10 border-white/10 bg-black/30 text-white placeholder:text-zinc-500"
            />
            <button
              onClick={handlePlaceLookup}
              className="shrink-0 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-black hover:bg-emerald-400 transition-colors"
            >
              Search
            </button>
          </div>

          {aqiLookupError && <p className="mt-2 text-xs text-amber-300">{aqiLookupError}</p>}

          {aqiLookup && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Lookup result</p>
                  <h3 className="text-base font-bold text-white">{aqiLookup.place}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${aqiBandStyles[aqiLookup.band].badge}`}>
                  {aqiLookup.label}
                </span>
              </div>

              <div className="flex items-end gap-2 mb-2">
                <span className={`text-3xl font-black ${aqiBandStyles[aqiLookup.band].text}`}>{aqiLookup.aqi}</span>
                <span className="text-xs text-zinc-500 pb-1">AQI</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{aqiLookup.summary}</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-red-500/10 to-transparent border-l-2 border-red-500 rounded-r-xl p-4 flex items-start gap-3 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping mt-1.5 shrink-0" />
          <div className="w-full">
            <p className="text-sm font-bold text-red-400 mb-1">Hazard Alert in your sector</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Air quality has dropped below safe margins due to trapped urban heat and roadside buildup.
            </p>
            <div className="mt-3 grid gap-2">
              {localSafetyMeasures.map((measure) => (
                <div key={measure} className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-200">
                  {measure}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleNearestCleanZone}
          className="w-full mt-3 py-3 bg-white/5 hover:bg-white/10 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-sm font-bold flex items-center justify-between px-4 transition-all text-emerald-400 group relative z-10 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4" />
            <span>{greenDestination ? 'Refresh Clean Zone Route' : 'Find Nearest Clean Zone'}</span>
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {greenDestination && (
          <div className="relative z-10 mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Nearest clean zone</p>
                <h3 className="text-base font-bold text-white">{greenDestination.name}</h3>
              </div>
              <span className="rounded-full border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                {greenDestination.distanceKm.toFixed(1)} km
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-emerald-100/80">{greenDestination.note}</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {activeMetric && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="pointer-events-auto absolute bottom-4 md:bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-[400px] bg-[#0c0c0e]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] z-50 text-white"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold tracking-tight capitalize">{activeMetric} Deep-Dive</h3>
              <button onClick={() => setActiveMetric(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors bg-white/5 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <h4 className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Historical Trend</h4>
                <div className="h-24 w-full flex items-end gap-2 overflow-hidden px-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ delay: i * 0.05 }}
                      className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-400 rounded-t-sm"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-[10px] text-zinc-500 font-medium">
                  <span>8:00 AM</span>
                  <span>Current</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Impact Analysis</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Current levels indicate prolonged exposure may affect individuals with respiratory conditions.
                  The <span className="text-emerald-400 font-semibold">{highlightedCleanZone}</span> ({highlightedCleanZoneDistance} km away) is currently providing a localized buffer.
                </p>
              </div>

              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold flex items-center justify-between px-4 transition-colors cursor-pointer group">
                <span>Set Custom Alert for this Metric</span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}

        {showPulseCheck && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="pointer-events-auto absolute bottom-4 md:bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-[400px] bg-[#0c0c0e]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] z-50 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Mission Accomplished!</h3>
                <p className="text-xs text-emerald-400 font-medium">+50 XP Earned</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-2 block">1. How safe did you feel?</label>
                <input type="range" min="1" max="10" value={questions.safety} onChange={(e) => setQuestions((q) => ({ ...q, safety: parseInt(e.target.value) }))} className="w-full mb-1 accent-emerald-500" />
                <div className="flex justify-between text-[10px] text-zinc-500"><span>Unsafe</span><span>Very Safe</span></div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-2 block">2. Was the pollution accurately predicted?</label>
                <input type="range" min="1" max="10" value={questions.accuracy} onChange={(e) => setQuestions((q) => ({ ...q, accuracy: parseInt(e.target.value) }))} className="w-full mb-1 accent-emerald-500" />
                <div className="flex justify-between text-[10px] text-zinc-500"><span>Not at all</span><span>Perfectly</span></div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 mb-2 block">3. Any additional comments?</label>
                <textarea
                  value={questions.comments}
                  onChange={(e) => setQuestions((q) => ({ ...q, comments: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-emerald-500/50 text-zinc-200"
                  rows={2}
                  placeholder="Optional feedback..."
                />
              </div>
            </div>

            <button
              onClick={async () => {
                if (user && cleanupId) {
                  await submitSurvey({ clerkId: user.id, cleanupId: cleanupId as any, safetyRating: questions.safety, accuracyRating: questions.accuracy, comments: questions.comments })
                }
                setShowPulseCheck(false)
                setQuestions({ safety: 5, accuracy: 5, comments: '' })
              }}
              className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Submit Pulse Check
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
