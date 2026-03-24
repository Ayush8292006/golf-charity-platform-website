'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, CheckCircle, XCircle, DollarSign, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Winner {
  id: string
  draw_id: string
  user_id: string
  match_type: string
  prize_amount: number
  verification_status: string
  payout_status: string
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
  draws?: {
    draw_month: string
    winning_numbers: string
  }
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    fetchWinners()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== 'admin@example.com') {
      router.push('/dashboard')
    }
  }

  async function fetchWinners() {
    const { data } = await supabase
      .from('winners')
      .select(`
        *,
        profiles (full_name, email),
        draws (draw_month, winning_numbers)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setWinners(data)
    setLoading(false)
  }

  async function verifyWinner(id: string) {
    const { error } = await supabase
      .from('winners')
      .update({ verification_status: 'approved' })
      .eq('id', id)
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Winner verified!')
      fetchWinners()
    }
  }

  async function rejectWinner(id: string) {
    const { error } = await supabase
      .from('winners')
      .update({ verification_status: 'rejected' })
      .eq('id', id)
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Winner rejected!')
      fetchWinners()
    }
  }

  async function markPaid(id: string) {
    const { error } = await supabase
      .from('winners')
      .update({ payout_status: 'paid' })
      .eq('id', id)
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Payment marked as paid!')
      fetchWinners()
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <ArrowLeft className="w-6 h-6 text-white hover:text-teal-400" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Winner Management</h1>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-teal-500" />
            <div>
              <div className="text-3xl font-bold text-white">{winners.length}</div>
              <div className="text-gray-400">Total Winners</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {winners.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-12 text-center border border-white/10">
              <p className="text-gray-400">No winners yet. Run draws to generate winners!</p>
            </div>
          ) : (
            winners.map((winner) => (
              <div key={winner.id} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {winner.profiles?.full_name || winner.profiles?.email || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        winner.match_type === '5-number' ? 'bg-green-500/20 text-green-400' :
                        winner.match_type === '4-number' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {winner.match_type?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        winner.verification_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        winner.verification_status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {winner.verification_status?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        winner.payout_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {winner.payout_status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-400">${winner.prize_amount}</div>
                    <div className="text-gray-400 text-sm">Prize Amount</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-gray-400 text-sm">Draw</div>
                    <div className="text-white">{winner.draws?.draw_month || '-'}</div>
                    <div className="text-gray-400 text-sm mt-1">
                      Numbers: {winner.draws?.winning_numbers || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Winner Email</div>
                    <div className="text-white">{winner.profiles?.email || '-'}</div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  {winner.verification_status === 'pending' && (
                    <>
                      <button
                        onClick={() => verifyWinner(winner.id)}
                        className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify</span>
                      </button>
                      <button
                        onClick={() => rejectWinner(winner.id)}
                        className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  {winner.verification_status === 'approved' && winner.payout_status === 'pending' && (
                    <button
                      onClick={() => markPaid(winner.id)}
                      className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Mark as Paid</span>
                    </button>
                  )}
                </div>
                
                <div className="text-gray-500 text-xs mt-4">
                  Winner Date: {new Date(winner.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}