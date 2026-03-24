'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Mail, Calendar, Shield, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== 'admin@example.com') {
      router.push('/dashboard')
    }
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setUsers(data)
      setFilteredUsers(data)
    }
    setLoading(false)
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
          <h1 className="text-3xl font-bold text-white">User Management</h1>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <Users className="w-12 h-12 text-teal-500" />
            <div>
              <div className="text-3xl font-bold text-white">{users.length}</div>
              <div className="text-gray-400">Total Users</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-white font-medium">User</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Email</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Joined</th>
                  <th className="text-left py-4 px-6 text-white font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{user.full_name?.charAt(0) || user.email?.charAt(0)}</span>
                          </div>
                          <span className="text-white">{user.full_name || 'Not set'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300">{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          user.email === 'admin@example.com' ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.email === 'admin@example.com' ? 'Admin' : 'User'}
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