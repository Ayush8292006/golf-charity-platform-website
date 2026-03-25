'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions')
      return
    }
    
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          full_name: fullName || email.split('@')[0],
          created_at: new Date().toISOString()
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          toast.error('Account created but profile error. Please contact admin.')
        } else {
          toast.success('Account created successfully!')
        }
        
        router.push('/auth/login')
      }
    } catch (err) {
      console.error('Signup error:', err)
      toast.error('Something went wrong')
    }
    
    setLoading(false)
  }

  // Password strength check
  const getPasswordStrength = () => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strengthLevel = getPasswordStrength()
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'][strengthLevel - 1] || ''
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][strengthLevel]

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
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 mt-2">Join Golf4Good and make a difference</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-5">
            
            {/* Full Name Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all ${
                          strengthLevel >= level ? strengthColor : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${strengthLevel >= 3 ? 'text-green-400' : strengthLevel >= 2 ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {strengthText || 'Password strength'}
                  </p>
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-teal-400 hover:text-teal-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-teal-400 hover:text-teal-300">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl font-semibold text-white overflow-hidden transition-all hover:shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create account
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
              <span className="bg-transparent px-3 text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition group"
            >
              <span>Sign in instead</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          By joining, you agree to our community guidelines
        </p>
      </div>
    </div>
  )
}