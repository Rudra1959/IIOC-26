import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Shield, MapPin, Zap, Brain, ArrowRight, Activity } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const features = [
  {
    icon: MapPin,
    title: 'Hyper-Local 500m Grid',
    description: 'H3 hexagonal cells map every pocket of pollution at street-level resolution.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Brain,
    title: 'Decision Intelligence',
    description: 'AI-powered source attribution identifies exactly what is causing bad air quality.',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Urban Heat Islands',
    description: 'Detect concrete "heat traps" that amplify both temperature and pollution.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: Shield,
    title: 'Threshold Actions',
    description: 'Automated government alerts when environmental risk scores breach safety limits.',
    gradient: 'from-emerald-500 to-teal-600',
  },
]

function LandingPage() {
  const { isSignedIn } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) {
      navigate({ to: '/dashboard' })
    }
  }, [isSignedIn, navigate])

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse" />
            <span className="text-lg font-bold tracking-tight">AirSentinel</span>
            <span className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase font-semibold">OS</span>
          </div>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-xl hover:bg-zinc-200 transition-all cursor-pointer">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-zinc-400">Real-time Environmental Monitoring</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
              <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                Your City&apos;s
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Digital Twin
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A 3D environmental intelligence platform that maps pollution, heat islands, 
              and air quality at <span className="text-white font-medium">500-meter resolution</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <SignUpButton mode="modal">
              <button className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold rounded-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                Launch Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 border border-white/10 text-zinc-300 font-medium rounded-2xl hover:bg-white/5 transition-all duration-300 text-center"
            >
              View on GitHub
            </a>
          </motion.div>
        </div>

        {/* Mock 3D preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto mt-16 relative"
        >
          <div className="aspect-[16/9] rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden relative shadow-2xl shadow-black/50">
            <div className="absolute inset-0 bg-[url('https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json')] opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-zinc-500 font-mono">LIVE MONITORING</span>
                </div>
                <div className="grid grid-cols-5 gap-2 px-8">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 8 }}
                      animate={{ height: 8 + Math.random() * 48 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: i * 0.1,
                      }}
                      className="w-8 rounded-t-sm"
                      style={{
                        background: `linear-gradient(to top, ${
                          Math.random() > 0.6
                            ? '#ef4444'
                            : Math.random() > 0.3
                              ? '#f97316'
                              : '#22c55e'
                        }, transparent)`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for City-Scale Intelligence</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Every feature is engineered for real-time environmental decision-making.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to monitor your city?</h2>
            <p className="text-zinc-500 mb-8">Join the platform governments and citizens trust for real-time air quality intelligence.</p>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition-all cursor-pointer">
                Create Free Account
              </button>
            </SignUpButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-zinc-600">AirSentinel OS</span>
          </div>
          <p className="text-xs text-zinc-700">© 2026 Environmental Intelligence Platform</p>
        </div>
      </footer>
    </div>
  )
}
