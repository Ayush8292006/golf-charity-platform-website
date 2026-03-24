'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, LogOut, Target, Trophy, Calendar, Activity, TrendingUp, Award, Sparkles, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Score {
  id: string
  score: number
  score_date: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [newScore, setNewScore] = useState('')
  const [scoreDate, setScoreDate] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUser(user)
    await Promise.all([fetchProfile(user.id), fetchScores(user.id)])
    setLoading(false)
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  async function fetchScores(userId: string) {
    const { data } = await supabase.from('scores').select('*').eq('user_id', userId).order('score_date', { ascending: false }).limit(5)
    if (data) setScores(data)
  }

  async function addScore(e: React.FormEvent) {
    e.preventDefault()
    if (!newScore || !scoreDate) { toast.error('Please enter score and date'); return }
    const scoreNum = parseInt(newScore)
    if (scoreNum < 1 || scoreNum > 45) { toast.error('Score must be between 1 and 45'); return }
    const { error } = await supabase.from('scores').insert({ user_id: user.id, score: scoreNum, score_date: scoreDate })
    if (error) toast.error(error.message)
    else { toast.success('Score added!'); setNewScore(''); setScoreDate(''); fetchScores(user.id) }
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/') }

  const totalScores = scores.length
  const averageScore = totalScores > 0 ? (scores.reduce((sum, s) => sum + s.score, 0) / totalScores).toFixed(1) : '0'
  const bestScore = totalScores > 0 ? Math.max(...scores.map(s => s.score)) : 0

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
              <span className="text-xl font-semibold text-white">Golf4Good</span>
            </div>
            <div className="flex items-center gap-4">
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
          <h1 className="text-2xl font-bold text-white">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0] || 'Golfer'}! 👋</h1>
          <p className="text-gray-400 mt-1">Track your scores and improve your game</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Scores</p>
                <p className="text-2xl font-bold text-white mt-1">{totalScores}</p>
              </div>
              <Activity className="w-8 h-8 text-teal-500/50 group-hover:text-teal-500 transition" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white mt-1">{averageScore}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500/50 group-hover:text-blue-500 transition" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Best Score</p>
                <p className="text-2xl font-bold text-white mt-1">{bestScore}</p>
              </div>
              <Trophy className="w-8 h-8 text-amber-500/50 group-hover:text-amber-500 transition" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rank</p>
                <p className="text-2xl font-bold text-white mt-1">#{bestScore ? Math.floor(bestScore / 10) + 1 : 0}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500/50 group-hover:text-purple-500 transition" />
            </div>
          </div>
        </div>

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