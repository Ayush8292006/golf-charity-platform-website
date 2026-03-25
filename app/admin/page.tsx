'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Heart, LogOut, Users, Trophy, Gift, HandHeart, 
  TrendingUp, Settings, DollarSign, RefreshCw, 
  ChevronRight, Calendar, Award, UserCheck, 
  BarChart3, Sparkles, Shield, Wallet
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ 
    users: 0, 
    subscriptions: 0,
    draws: 0, 
    charities: 0, 
    winners: 0,
    totalRevenue: 0
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentWinners, setRecentWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { 
    checkAdmin()
  }, [])

  async function checkAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        router.push('/auth/login')
        return 
      }
      if (user.email !== 'admin@example.com') { 
        router.push('/dashboard')
        return 
      }
      setUser(user)
      await loadAllData()
    } catch (error) {
      console.error('Check admin error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAllData() {
    try {
      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      // Get subscriptions count and revenue
      const { data: subscriptions, count: subsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })
      
      // Calculate total revenue
      let revenue = 0
      subscriptions?.forEach(sub => {
        if (sub.status === 'active') {
          if (sub.plan_type === 'monthly') {
            revenue += 10
          } else if (sub.plan_type === 'yearly') {
            revenue += 100
          }
        }
      })
      
      // Get draws count
      const { count: drawsCount } = await supabase
        .from('draws')
        .select('*', { count: 'exact', head: true })
      
      // Get charities count
      const { count: charitiesCount } = await supabase
        .from('charities')
        .select('*', { count: 'exact', head: true })
      
      // Get winners count
      const { count: winnersCount } = await supabase
        .from('winners')
        .select('*', { count: 'exact', head: true })
      
      // Get recent users
      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Get recent winners
      const { data: recentWinnersData } = await supabase
        .from('winners')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Get profiles for winners
      let winnersWithProfiles = []
      if (recentWinnersData && recentWinnersData.length > 0) {
        const userIds = recentWinnersData.map(w => w.user_id).filter(Boolean)
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds)
          
          const profileMap = new Map()
          profiles?.forEach(p => profileMap.set(p.id, p))
          
          winnersWithProfiles = recentWinnersData.map(winner => ({
            ...winner,
            profiles: profileMap.get(winner.user_id) || { full_name: 'User', email: 'No email' }
          }))
        } else {
          winnersWithProfiles = recentWinnersData
        }
      }

      setStats({
        users: usersCount || 0,
        subscriptions: subsCount || 0,
        draws: drawsCount || 0,
        charities: charitiesCount || 0,
        winners: winnersCount || 0,
        totalRevenue: revenue
      })
      setRecentUsers(recentUsersData || [])
      setRecentWinners(winnersWithProfiles)
      
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  async function refreshStats() {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  async function handleLogout() { 
    await supabase.auth.signOut()
    router.push('/') 
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
            <div className="flex items-center gap-3">
              <button 
                onClick={refreshStats} 
                disabled={refreshing}
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 hover:text-teal-400 transition ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={handleLogout} 
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition" />
              </button>
            </div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.users}</p>
              </div>
              <Users className="w-8 h-8 text-teal-500/50" />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Subscriptions</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.subscriptions}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500/50" />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">${stats.totalRevenue}</p>
              </div>
              <Wallet className="w-8 h-8 text-yellow-500/50" />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Draws</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.draws}</p>
              </div>
              <Gift className="w-8 h-8 text-blue-500/50" />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Charities</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.charities}</p>
              </div>
              <HandHeart className="w-8 h-8 text-amber-500/50" />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Winners</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.winners}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500/50" />
            </div>
          </div>
        </div>

        {/* Recent Users & Winners */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-semibold text-white">Recent Users</h2>
            </div>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-gray-400 text-sm">No users yet</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">{user.full_name || 'User'}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Recent Winners</h2>
            </div>
            <div className="space-y-3">
              {recentWinners.length === 0 ? (
                <p className="text-gray-400 text-sm">No winners yet</p>
              ) : (
                recentWinners.map((winner) => (
                  <div key={winner.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {winner.profiles?.full_name || 'User'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {winner.match_type || 'N/A'} • ${winner.prize_amount || 0}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      winner.verification_status === 'approved' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {winner.verification_status || 'pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href: '/admin/charities', icon: HandHeart, title: 'Charity Management', desc: 'Add, edit, and manage charities', color: 'teal' },
            { href: '/admin/draws', icon: Gift, title: 'Draw Management', desc: 'Run monthly draws', color: 'blue' },
            { href: '/admin/users', icon: Users, title: 'User Management', desc: 'View and manage users', color: 'purple' },
            { href: '/admin/subscriptions', icon: DollarSign, title: 'Subscriptions', desc: 'View all subscriptions', color: 'emerald' },
            { href: '/admin/winners', icon: Trophy, title: 'Winner Management', desc: 'Verify and payout winners', color: 'amber' },
            { href: '/admin/reports', icon: TrendingUp, title: 'Reports', desc: 'View platform analytics', color: 'emerald' },
            { href: '/admin/settings', icon: Settings, title: 'Settings', desc: 'Configure platform', color: 'gray' }
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