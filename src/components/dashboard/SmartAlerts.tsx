import { BellRing, ShieldAlert, Zap, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export function SmartAlerts() {
  const [isOpen, setIsOpen] = useState(false)
  const [threshold, setThreshold] = useState(70)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="pointer-events-auto absolute top-20 left-4 bg-[#09090b]/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl hover:bg-white/10 transition-colors group z-20"
      >
        <BellRing className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            className="pointer-events-auto absolute top-20 left-20 w-80 bg-[#09090b]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl text-white z-50"
          >
            <div className="flex justify-between items-center mb-5">
               <h3 className="font-bold flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-emerald-400" />
                 Smart Triggers
               </h3>
               <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors cursor-pointer">
                 <X className="w-4 h-4" />
               </button>
            </div>

            <div className="space-y-5">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-zinc-300">AQI Danger Alert</span>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">&gt;{threshold}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-zinc-500 mt-2 text-center">Alert me when Air Quality breaches {threshold}</p>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                   <p className="text-sm font-bold text-emerald-400 mb-1">Hyper-local push enabled</p>
                   <p className="text-xs text-zinc-400 leading-relaxed">Notifications will route to your device if an anomaly enters your 500m radius.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
