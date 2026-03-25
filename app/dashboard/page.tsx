'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Heart, LogOut, Target, Trophy, Calendar, Activity, 
  TrendingUp, Award, Sparkles, ChevronRight, CreditCard,
  HandHeart, Users, Gift, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Score {
  id: string
  score: number
  score_date: string
}

interface Subscription {
  id: string
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'expired'
  current_period_end: string
}

interface Settings {
  platform_name: string
  monthly_price: number
  yearly_price: number
  charity_min_percentage: number
}

interface Charity {
  id: string
  name: string
  description: string
  featured: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [charities, setCharities] = useState<Charity[]>([])
  const [newScore, setNewScore] = useState('')
  const [scoreDate, setScoreDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userRank, setUserRank] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [recentWinners, setRecentWinners] = useState<any[]>([])
  const [upcomingDraw, setUpcomingDraw] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    // Set up real-time subscription for scores
    const scoresSubscription = supabase
      .channel('scores-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'scores' },
        () => {
          console.log('New score added, refreshing...')
          if (user) fetchScores(user.id)
        }
      )
      .subscribe()

    return () => {
      scoresSubscription.unsubscribe()
    }
  }, [user])

 async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/auth/login'); return }
  setUser(user)
  await Promise.all([
    fetchProfile(user.id),
    fetchSubscription(user.id),
    fetchScores(user.id),
    fetchSettings(),
    fetchCharities(),
    fetchRanking(user.id)
  ])
  setLoading(false)
}

  async function refreshAllData() {
    if (!user) return
    setRefreshing(true)
    await Promise.all([
      fetchProfile(user.id),
      fetchSubscription(user.id),
      fetchScores(user.id),
      fetchSettings(),
      fetchCharities(),
      fetchRanking(user.id),
      fetchRecentWinners(),
      fetchUpcomingDraw()
    ])
    setRefreshing(false)
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  async function fetchSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (error) {
        console.error('Subscription error:', error.message)
        setSubscription(null)
        return
      }
      
      if (data && data.status === 'active') {
        setSubscription(data)
      } else {
        setSubscription(null)
      }
    } catch (err) {
      console.error('Error:', err)
      setSubscription(null)
    }
  }

  async function fetchScores(userId: string) {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })
      .limit(5)
    if (data) setScores(data)
  }

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*').single()
    if (data) setSettings(data)
  }

  async function fetchCharities() {
    const { data } = await supabase
      .from('charities')
      .select('*')
      .order('featured', { ascending: false })
      .limit(3)
    if (data) setCharities(data)
  }

  async function fetchRanking(userId: string) {
    try {
      const { data: allScores, error } = await supabase
        .from('scores')
        .select('user_id, score')
      
      if (error || !allScores || allScores.length === 0) {
        setUserRank(0)
        setTotalPlayers(0)
        return
      }
      
      const userBest: { [key: string]: number } = {}
      allScores.forEach(score => {
        if (!userBest[score.user_id] || score.score > userBest[score.user_id]) {
          userBest[score.user_id] = score.score
        }
      })
      
      const leaderboard = Object.entries(userBest)
        .map(([uid, bestScore]) => ({ uid, bestScore }))
        .sort((a, b) => b.bestScore - a.bestScore)
      
      const total = leaderboard.length
      const rank = leaderboard.findIndex(item => item.uid === userId) + 1
      
      setUserRank(rank)
      setTotalPlayers(total)
    } catch (error) {
      console.error('Rank error:', error)
    }
  }

  async function fetchRecentWinners() {
    const { data } = await supabase
      .from('winners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (data) {
      const userIds = data.map(w => w.user_id).filter(Boolean)
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
        
        const profileMap = new Map()
        profiles?.forEach(p => profileMap.set(p.id, p))
        
        const winnersWithProfiles = data.map(winner => ({
          ...winner,
          profiles: profileMap.get(winner.user_id) || { full_name: 'User', email: 'No email' }
        }))
        setRecentWinners(winnersWithProfiles)
      } else {
        setRecentWinners(data)
      }
    }
  }

  async function fetchUpcomingDraw() {
    const { data } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) setUpcomingDraw(data)
  }

  async function addScore(e: React.FormEvent) {
    e.preventDefault()
    if (!newScore || !scoreDate) { toast.error('Please enter score and date'); return }
    const scoreNum = parseInt(newScore)
    if (scoreNum < 1 || scoreNum > 45) { toast.error('Score must be between 1 and 45'); return }
    
    const { error } = await supabase.from('scores').insert({ 
      user_id: user.id, 
      score: scoreNum, 
      score_date: scoreDate 
    })
    
    if (error) {
      toast.error(error.message)
    } else { 
      toast.success('Score added!') 
      setNewScore('')
      setScoreDate('')
      await refreshAllData()
    }
  }

  async function handleLogout() { 
    await supabase.auth.signOut()
    router.push('/') 
  }

  const totalScores = scores.length
  const averageScore = totalScores > 0 
    ? (scores.reduce((sum, s) => sum + s.score, 0) / totalScores).toFixed(1) 
    : '0'
  const bestScore = totalScores > 0 
    ? Math.max(...scores.map(s => s.score)) 
    : 0

  const isSubscriptionActive = subscription?.status === 'active'
  const daysLeft = subscription?.current_period_end 
    ? Math.ceil((new Date(subscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

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
              <span className="text-xl font-semibold text-white">
                {settings?.platform_name || 'Golf4Good'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={refreshAllData} 
                disabled={refreshing}
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 hover:text-teal-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-medium">{profile?.full_name || user?.email}</p>
                <p className="text-gray-400 text-xs">Member</p>
              </div>
              <button onClick={handleLogout} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition group">
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0] || 'Golfer'}! 👋
          </h1>
          <p className="text-gray-400 mt-1">Track your scores and improve your game</p>
        </div>

       // In dashboard, prices are already from settings
{settings && (
  <div className="bg-white/5 rounded-xl p-4 mb-6">
    <p className="text-white text-sm">
      Monthly: ${settings.monthly_price} | Yearly: ${settings.yearly_price}
    </p>
  </div>
)}

        {/* Subscription Status Card */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-teal-500" />
              <div>
                <p className="text-sm text-gray-400">Subscription Status</p>
                {isSubscriptionActive ? (
                  <div>
                    <span className="text-green-400 font-semibold">Active - {subscription?.plan_type} plan</span>
                    <p className="text-gray-400 text-xs mt-1">
                      {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expires today'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Renews on: {new Date(subscription?.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-yellow-400 font-semibold">No active subscription</span>
                    <p className="text-gray-400 text-xs mt-1">Subscribe to participate in draws</p>
                  </div>
                )}
              </div>
            </div>
            {!isSubscriptionActive && (
              <Link href="/pricing">
                <button className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                  Subscribe Now - ${settings?.monthly_price || 10}/month
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Upcoming Draw Card */}
        {upcomingDraw && (
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl border border-white/10 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Upcoming Draw</p>
                  <p className="text-white font-medium">{upcomingDraw.draw_month}</p>
                  <p className="text-yellow-400 text-sm">Prize: ${upcomingDraw.prize_amount}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {upcomingDraw.winning_numbers?.split(', ').map((num: string, i: number) => (
                  <div key={i} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">{num}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Winners */}
        {recentWinners.length > 0 && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Recent Winners</h3>
            </div>
            <div className="space-y-2">
              {recentWinners.slice(0, 3).map((winner) => (
                <div key={winner.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{winner.profiles?.full_name || 'User'}</span>
                  <span className="text-teal-400">${winner.prize_amount}</span>
                  <span className="text-gray-500 text-xs">{winner.match_type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
     {/* Stats Grid */}
{/* Stats Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
  
  {/* Total Scores Card */}
  <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 hover:border-teal-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-teal-500/5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Scores</p>
        <p className="text-4xl font-bold text-white mt-2">{totalScores}</p>
      </div>
      <div className="p-3 bg-teal-500/10 rounded-2xl group-hover:bg-teal-500/20 transition-all duration-300">
        <Activity className="w-7 h-7 text-teal-400" />
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-gray-500 text-sm flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400"></span>
        Scores recorded
      </p>
    </div>
  </div>

  {/* Average Score Card */}
  <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 hover:border-blue-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Average Score</p>
        <p className="text-4xl font-bold text-white mt-2">{averageScore}</p>
      </div>
      <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-all duration-300">
        <TrendingUp className="w-7 h-7 text-blue-400" />
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-gray-500 text-sm flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
        Per round average
      </p>
    </div>
  </div>

  {/* Best Score Card */}
  <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-amber-500/5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Best Score</p>
        <p className="text-4xl font-bold text-white mt-2">{bestScore}</p>
      </div>
      <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-all duration-300">
        <Trophy className="w-7 h-7 text-amber-400" />
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-gray-500 text-sm flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Personal best
      </p>
    </div>
  </div>
  
</div>
        {/* Charities Section */}
        {charities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-teal-400" />
              Featured Charities
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {charities.map((charity) => (
                <div key={charity.id} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition">
                  <h3 className="text-white font-medium">{charity.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{charity.description}</p>
                  {charity.featured && (
                    <span className="inline-block mt-2 text-xs text-teal-400">⭐ Featured</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add Score Card */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <Target className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Add New Score</h2>
            </div>
            <form onSubmit={addScore} className="space-y-4">
              <input
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="Stableford Score (1-45)"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                min="1"
                max="45"
              />
              <input
                type="date"
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
              />
              <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 group">
                <Sparkles className="w-4 h-4" />
                Add Score
              </button>
            </form>
          </div>

          {/* Recent Scores Card */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Recent Scores</h2>
            </div>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No scores yet</p>
                <p className="text-gray-500 text-sm mt-1">Add your first score above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((score, idx) => (
                  <div key={score.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition group">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400">#{idx + 1}</span>
                      <span className="text-white">Score</span>
                    </div>
                    <span className="text-xl font-bold text-teal-400">{score.score}</span>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(score.score_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">Quick Tips</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {['Focus on consistent swing tempo', 'Practice putting 15 min daily', 'Track fairways and GIR', 'Warm up before rounds'].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                <ChevronRight className="w-3 h-3 text-teal-400" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}