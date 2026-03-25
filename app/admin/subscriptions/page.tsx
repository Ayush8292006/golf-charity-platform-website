'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, Mail, User, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    loadData()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== 'admin@example.com') {
      router.push('/dashboard')
    }
  }

async function loadData() {
  setLoading(true)
  try {
    // Get all subscriptions
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (subsError) {
      console.error('Subscriptions error:', subsError)
      setSubscriptions([])
      setLoading(false)
      return
    }

    if (!subs || subs.length === 0) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')

    if (profilesError) {
      console.error('Profiles error:', profilesError)
      setSubscriptions(subs)
      setLoading(false)
      return
    }

    // Create profile map
    const profileMap = new Map()
    profiles?.forEach(p => {
      profileMap.set(p.id, p)
    })

    // Merge data
    const merged = subs.map(sub => ({
      ...sub,
      profiles: profileMap.get(sub.user_id) || { full_name: 'Unknown', email: 'No email' }
    }))

    console.log('Subscriptions loaded:', merged.length)
    setSubscriptions(merged)
  } catch (err) {
    console.error('Error:', err)
    setSubscriptions([])
  } finally {
    setLoading(false)
  }
}

  async function refreshData() {
    await loadData()
  }

  function getUserName(sub: any): string {
    if (sub.profiles?.full_name) return sub.profiles.full_name
    return 'User'
  }

  function getUserEmail(sub: any): string {
    if (sub.profiles?.email) return sub.profiles.email
    return 'No email'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <ArrowLeft className="w-6 h-6 text-white hover:text-teal-400" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
          </div>
          <button
            onClick={refreshData}
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
          >
            <RefreshCw className="w-5 h-5 text-gray-400 hover:text-teal-400" />
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <DollarSign className="w-12 h-12 text-teal-500" />
            <div>
              <div className="text-3xl font-bold text-white">{subscriptions.length}</div>
              <div className="text-gray-400">Total Subscriptions</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-white font-medium">User</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Plan</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Renewal Date</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Subscribed On</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">No subscriptions yet</td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-teal-400" />
                            {getUserName(sub)}
                          </p>
                          <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {getUserEmail(sub)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          sub.plan_type === 'monthly' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {sub.plan_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300 text-sm">
                            {new Date(sub.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300 text-sm">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}