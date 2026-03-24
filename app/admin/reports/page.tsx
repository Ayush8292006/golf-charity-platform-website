'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, Trophy, Gift, HandHeart, Calendar, Download, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubscriptions: 0,
    totalScores: 0,
    totalDraws: 0,
    totalWinners: 0,
    totalPrizePaid: 0,
    totalCharityDonated: 0,
    conversionRate: 0
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    fetchReports()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== 'admin@example.com') {
      router.push('/dashboard')
    }
  }

  async function fetchReports() {
    setLoading(true)
    
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: drawsCount } = await supabase.from('draws').select('*', { count: 'exact', head: true })
    const { count: winnersCount } = await supabase.from('winners').select('*', { count: 'exact', head: true })
    const { count: scoresCount } = await supabase.from('scores').select('*', { count: 'exact', head: true })
    
    setStats({
      totalUsers: usersCount || 0,
      totalSubscriptions: 0,
      totalScores: scoresCount || 0,
      totalDraws: drawsCount || 0,
      totalWinners: winnersCount || 0,
      totalPrizePaid: 0,
      totalCharityDonated: 0,
      conversionRate: 0
    })
    
    setLoading(false)
  }

  async function refreshReports() {
    setRefreshing(true)
    await fetchReports()
    setRefreshing(false)
    toast.success('Reports refreshed!')
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <ArrowLeft className="w-6 h-6 text-white hover:text-teal-400" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          </div>
          <button
            onClick={refreshReports}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <Users className="w-8 h-8 text-teal-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <div className="text-gray-400 text-sm">Total Users</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <Gift className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalDraws}</div>
            <div className="text-gray-400 text-sm">Total Draws</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <Trophy className="w-8 h-8 text-amber-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalWinners}</div>
            <div className="text-gray-400 text-sm">Total Winners</div>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalScores}</div>
            <div className="text-gray-400 text-sm">Total Scores</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Draws</p>
              <p className="text-xl font-bold text-white">{stats.totalDraws}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Winners</p>
              <p className="text-xl font-bold text-white">{stats.totalWinners}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Scores</p>
              <p className="text-xl font-bold text-white">{stats.totalScores}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}