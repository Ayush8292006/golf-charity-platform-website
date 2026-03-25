'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      if (email === 'admin@example.com') router.push('/admin')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Heart className="w-12 h-12 text-teal-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue your journey</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-400 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-xs text-gray-500 hover:text-teal-400 transition">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl font-semibold text-white overflow-hidden transition-all hover:shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 mt-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-gray-500">New here?</span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-medium transition border border-white/10 group"
            >
              <span>Create new account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Secure login with 256-bit encryption
        </p>
      </div>
    </div>
  )
}