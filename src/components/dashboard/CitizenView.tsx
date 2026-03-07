import { MapPin, Wind, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export function CitizenView() {
  const score = 84
  const isDangerous = score > 70

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="pointer-events-auto absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-[#09090b]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl text-white"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl text-white shadow-lg">
          <Wind className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold">Local Air Risk</h2>
          <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Current Location
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="flex items-end gap-2 mb-3">
          <span className="text-5xl font-black text-red-500 tracking-tighter">{score}</span>
          <span className="text-sm font-bold text-gray-500 mb-1.5">/ 100</span>
        </div>
        
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-rose-600 relative" style={{ width: `${score}%` }}>
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 animate-pulse" />
          </div>
        </div>

        <p className="mt-3 text-sm font-semibold flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isDangerous && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isDangerous ? 'bg-red-500' : 'bg-green-500'}`} />
          </span>
          Status: <span className={isDangerous ? 'text-red-400' : 'text-green-400'}>{isDangerous ? 'Dangerous' : 'Safe'}</span>
        </p>
        <p className="text-xs text-gray-400 mt-2">Best time for outdoor activity: 5:00 PM</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
          Find Cleanest Path
        </button>
        <button className="px-3 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors shrink-0 border border-white/10">
          <Info className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
