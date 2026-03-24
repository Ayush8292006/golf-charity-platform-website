'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, LogOut, Users, Trophy, Gift, HandHeart, TrendingUp, Settings, Shield, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ users: 0, draws: 0, charities: 0, winners: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    if (user.email !== 'admin@example.com') { router.push('/dashboard'); return }
    setUser(user)
    await fetchStats()
    setLoading(false)
  }

  async function fetchStats() {
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: draws } = await supabase.from('draws').select('*', { count: 'exact', head: true })
    const { count: charities } = await supabase.from('charities').select('*', { count: 'exact', head: true })
    const { count: winners } = await supabase.from('winners').select('*', { count: 'exact', head: true })
    setStats({ users: users || 0, draws: draws || 0, charities: charities || 0, winners: winners || 0 })
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/') }

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-teal-500" />
              <span className="text-xl font-semibold text-white">Admin Panel</span>
              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full">Administrator</span>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition group">
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.users}</p>
              </div>
              <Users className="w-8 h-8 text-teal-500/50" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Draws</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.draws}</p>
              </div>
              <Gift className="w-8 h-8 text-blue-500/50" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Charities</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.charities}</p>
              </div>
              <HandHeart className="w-8 h-8 text-amber-500/50" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Winners</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.winners}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500/50" />
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { href: '/admin/charities', icon: HandHeart, title: 'Charity Management', desc: 'Add, edit, and manage charities', color: 'teal' },
            { href: '/admin/draws', icon: Gift, title: 'Draw Management', desc: 'Run monthly draws and simulations', color: 'blue' },
            { href: '/admin/users', icon: Users, title: 'User Management', desc: 'View and manage users', color: 'purple' },
            { href: '/admin/winners', icon: Trophy, title: 'Winner Management', desc: 'Verify and payout winners', color: 'amber' },
            { href: '/admin/reports', icon: TrendingUp, title: 'Reports', desc: 'View platform analytics', color: 'emerald' },
            { href: '/admin/settings', icon: Settings, title: 'Settings', desc: 'Configure platform settings', color: 'gray' }
          ].map((item, i) => (
            <Link key={i} href={item.href}>
              <div className="group bg-white/5 rounded-xl border border-white/10 p-5 hover:bg-white/10 transition cursor-pointer">
                <item.icon className={`w-10 h-10 text-${item.color}-400 mb-3 group-hover:scale-105 transition`} />
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-500 group-hover:text-teal-400 transition">
                  <span>Manage</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}