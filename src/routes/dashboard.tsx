import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser, UserButton } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useEffect, useState } from 'react'
import { CityMap, type RouteSegment } from '#/components/map/CityMap'
import { GovView } from '#/components/dashboard/GovView'
import { CitizenView } from '#/components/dashboard/CitizenView'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()
  const syncUser = useMutation(api.users.getOrCreate)
  const [routeSegments] = useState<RouteSegment[]>([])

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: '/' })
    }
  }, [isLoaded, isSignedIn, navigate])

  // Sync user to Convex after sign-in
  useEffect(() => {
    if (user) {
      syncUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? '',
        name: user.fullName ?? undefined,
        avatarUrl: user.imageUrl ?? undefined,
      }).catch(console.error)
    }
  }, [user, syncUser])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#09090b]">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-[#09090b] overflow-hidden font-sans">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-white tracking-tight">AirSentinel</span>
          <span className="text-[9px] tracking-[0.2em] text-zinc-500 uppercase">OS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 hidden sm:block">
            Welcome, {user?.firstName ?? 'Agent'}
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </div>
      </div>

      {/* 3D Map */}
      <div className="absolute inset-0 z-0">
        <CityMap routeSegments={routeSegments} />
      </div>

      {/* Dashboard Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <GovView />
        <CitizenView />
      </div>
    </div>
  )
}
