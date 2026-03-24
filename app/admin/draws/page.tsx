'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    fetchDraws()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== 'admin@example.com') router.push('/dashboard')
  }

  async function fetchDraws() {
    const { data } = await supabase.from('draws').select('*').order('created_at', { ascending: false })
    if (data) setDraws(data)
    setLoading(false)
  }

  async function runDraw() {
    const numbers = [
      Math.floor(Math.random() * 50) + 1,
      Math.floor(Math.random() * 50) + 1,
      Math.floor(Math.random() * 50) + 1,
      Math.floor(Math.random() * 50) + 1,
      Math.floor(Math.random() * 50) + 1
    ]
    const numbersString = numbers.join(', ')
    const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    
    const { error } = await supabase.from('draws').insert({
      draw_month: monthName,
      winning_numbers: numbersString,
      prize_amount: 1000,
      status: 'published'
    })
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Draw completed!')
      fetchDraws()
    }
  }

  if (loading) return <div className="text-white p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0A0F1E] p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin"><ArrowLeft className="w-6 h-6 text-white hover:text-teal-400" /></Link>
            <h1 className="text-3xl font-bold text-white">Draw Management</h1>
          </div>
          <button onClick={runDraw} className="bg-teal-500 text-white px-4 py-2 rounded-lg">
            <Play className="w-5 h-5 inline mr-1" /> Run Monthly Draw
          </button>
        </div>

        <div className="space-y-4">
          {draws.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-8 text-center text-gray-400">No draws yet. Run your first draw!</div>
          ) : (
            draws.map((draw) => (
              <div key={draw.id} className="bg-white/10 rounded-2xl p-6">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold text-white">{draw.draw_month}</h3>
                  <span className="text-teal-400 font-bold">${draw.prize_amount}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {draw.winning_numbers?.split(', ').map((num: string, i: number) => (
                    <div key={i} className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}