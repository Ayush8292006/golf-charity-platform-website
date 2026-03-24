'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Check, ArrowRight, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    setLoading(planType)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login first')
      router.push('/auth/login')
      return
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, userId: user.id })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error('Something went wrong')
    }
    
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-400">Subscribe monthly or yearly and start making a difference</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Monthly</h2>
              <div className="text-4xl font-bold text-teal-500 mt-4">
                $10 <span className="text-lg text-gray-400">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300"><Check className="w-5 h-5 text-teal-500 mr-2" /> Enter unlimited scores</li>
              <li className="flex items-center text-gray-300"><Check className="w-5 h-5 text-teal-500 mr-2" /> Participate in monthly draws</li>
              <li className="flex items-center text-gray-300"><Check className="w-5 h-5 text-teal-500 mr-2" /> 10% goes to your chosen charity</li>
              <li className="flex items-center text-gray-300"><Check className="w-5 h-5 text-teal-500 mr-2" /> Cancel anytime</li>
            </ul>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {loading === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 relative">
            <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              Save 20%
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Yearly</h2>
              <div className="text-4xl font-bold text-white mt-4">
                $100 <span className="text-lg text-white/70">/year</span>
              </div>
              <div className="text-white/60 text-sm mt-1">Save $20 compared to monthly</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-white"><Check className="w-5 h-5 text-white/70 mr-2" /> Everything in Monthly</li>
              <li className="flex items-center text-white"><Check className="w-5 h-5 text-white/70 mr-2" /> 2 months free</li>
              <li className="flex items-center text-white"><Check className="w-5 h-5 text-white/70 mr-2" /> Priority support</li>
            </ul>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading === 'yearly'}
              className="w-full bg-white text-teal-600 hover:bg-gray-100 py-3 rounded-xl font-medium transition"
            >
              {loading === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}