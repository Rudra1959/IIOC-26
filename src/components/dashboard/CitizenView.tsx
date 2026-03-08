import { MapPin, Wind, Info, Droplets, Sun, Activity, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function CitizenView() {
  const score = 84
  
  const [activeMetric, setActiveMetric] = useState<string | null>(null)

  const metrics = [
    { id: 'aqi', title: 'Air Quality (AQI)', value: score, unit: '', icon: Wind, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'humidity', title: 'Humidity', value: 68, unit: '%', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'uv', title: 'UV Index', value: 8, unit: 'High', icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'pollen', title: 'Pollen Count', value: 120, unit: 'High', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' }
  ]

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pointer-events-auto absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-[#09090b]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white overflow-hidden"
      >
        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-white/5 to-transparent blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white shadow-lg shadow-red-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Local Environment</h2>
              <p className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                Hyper-local view • ±500m precision
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400">
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
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

        <div className="bg-gradient-to-r from-red-500/10 to-transparent border-l-2 border-red-500 rounded-r-xl p-4 flex items-start gap-3 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping mt-1.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-400 mb-1">Hazard Alert in your sector</p>
            <p className="text-xs text-zinc-400 leading-relaxed">Air quality has dropped below safe margins due to trapped urban heat. Minimize outdoor exertion.</p>
          </div>
        </div>

      </motion.div>

      {/* Deep-Dive Modal Overlay */}
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
                    {/* Mock chart bars */}
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
                   The <span className="text-emerald-400 font-semibold">City Green Belt</span> (1.2km away) is currently providing a localized buffer.
                 </p>
               </div>

               <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold flex items-center justify-between px-4 transition-colors cursor-pointer group">
                 <span>Set Custom Alert for this Metric</span>
                 <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
