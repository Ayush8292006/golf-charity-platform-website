'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Charity {
  id: string
  name: string
  description: string
  featured: boolean
  created_at: string
}

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', featured: false })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    fetchCharities()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== 'admin@example.com') {
      router.push('/dashboard')
    }
  }

  async function fetchCharities() {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    if (data) setCharities(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('charities').insert(formData)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Charity added!')
      setShowModal(false)
      setFormData({ name: '', description: '', featured: false })
      fetchCharities()
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this charity?')) {
      await supabase.from('charities').delete().eq('id', id)
      toast.success('Deleted!')
      fetchCharities()
    }
  }

  if (loading) return <div className="text-white p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0A0F1E] p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <ArrowLeft className="w-6 h-6 text-white hover:text-teal-400" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Charity Management</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-teal-500 text-white px-4 py-2 rounded-lg">
            <Plus className="w-5 h-5 inline mr-1" /> Add Charity
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {charities.map((charity) => (
            <div key={charity.id} className="bg-white/10 rounded-2xl p-6">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold text-white">{charity.name}</h3>
                <button onClick={() => handleDelete(charity.id)} className="text-red-400">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-300 mt-2">{charity.description}</p>
              {charity.featured && <span className="text-teal-400 text-sm mt-2 block">Featured</span>}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Add Charity</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" className="w-full p-2 mb-3 rounded bg-white/20 text-white"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <textarea placeholder="Description" className="w-full p-2 mb-3 rounded bg-white/20 text-white"
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                <label className="flex items-center text-white mb-4">
                  <input type="checkbox" className="mr-2" checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                  Featured Charity
                </label>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-teal-500 text-white py-2 rounded">Save</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-600 text-white py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}