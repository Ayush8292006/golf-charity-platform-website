'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Check, CreditCard, ArrowLeft, Settings, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PaymentModal from '@/app/components/PaymentModal'
import toast from 'react-hot-toast'

interface Settings {
  platform_name: string
  monthly_price: number
  yearly_price: number
  charity_min_percentage: number
}

export default function PricingPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()
      
      if (error) {
        console.error('Settings error:', error)
      } else if (data) {
        setSettings({
          platform_name: data.platform_name || 'Golf4Good',
          monthly_price: data.monthly_price || 10,
          yearly_price: data.yearly_price || 100,
          charity_min_percentage: data.charity_min_percentage || 10
        })
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login first')
      router.push('/auth/login')
      return
    }

    setSelectedPlan(planType)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login again')
      router.push('/auth/login')
      return
    }
    
    const endDate = new Date()
    if (selectedPlan === 'monthly') {
      endDate.setDate(endDate.getDate() + 30)
    } else {
      endDate.setDate(endDate.getDate() + 365)
    }

    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan_type: selectedPlan,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: endDate.toISOString()
    })

    if (error) {
      console.error('Subscription error:', error)
      toast.error(error.message)
    } else {
      toast.success(`Subscribed to ${selectedPlan} plan!`)
      router.push('/dashboard')
    }
  }

  const monthlyPrice = settings?.monthly_price || 10
  const yearlyPrice = settings?.yearly_price || 100
  const yearlySavings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        
        {/* Back Button */}
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 mb-6 border border-white/10">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-gray-400">Flexible Plans</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 max-w-md mx-auto">Subscribe monthly or yearly and start making a difference</p>
          <p className="text-teal-400 text-sm mt-3 inline-flex items-center gap-1 bg-teal-500/10 px-3 py-1 rounded-full">
            💳 Demo Mode
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* Monthly Plan */}
          <div className="group bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Monthly</h2>
              <div className="mt-4">
                <span className="text-5xl font-bold text-teal-400">${monthlyPrice}</span>
                <span className="text-gray-400 ml-1">/month</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Billed monthly</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300 text-sm">
                <Check className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                Enter unlimited scores
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <Check className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                Participate in monthly draws
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <Check className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                {settings?.charity_min_percentage}% goes to your chosen charity
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <Check className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                Cancel anytime
              </li>
            </ul>
            
            <button
              onClick={() => handleSubscribe('monthly')}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
            >
              <CreditCard className="w-4 h-4" />
              Subscribe Monthly - ${monthlyPrice}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="group relative bg-gradient-to-br from-teal-600/20 to-blue-600/20 rounded-2xl border border-teal-500/30 p-6 sm:p-8 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 text-white text-xs font-medium px-4 py-1 rounded-full shadow-lg">
                Best Value
              </span>
            </div>
            
            {/* Save Badge */}
            <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
              Save {yearlySavings}%
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Yearly</h2>
              <div className="mt-4">
                <span className="text-5xl font-bold text-teal-400">${yearlyPrice}</span>
                <span className="text-gray-400 ml-1">/year</span>
              </div>
              <p className="text-green-400 text-sm mt-2">Save ${monthlyPrice * 12 - yearlyPrice} annually</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-white text-sm">
                <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0" />
                Everything in Monthly
              </li>
              <li className="flex items-center text-white text-sm">
                <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0" />
                2 months free
              </li>
              <li className="flex items-center text-white text-sm">
                <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0" />
                Priority support
              </li>
              <li className="flex items-center text-white text-sm">
                <Check className="w-5 h-5 text-teal-400 mr-3 flex-shrink-0" />
                Exclusive badges
              </li>
            </ul>
            
            <button
              onClick={() => handleSubscribe('yearly')}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
            >
              <CreditCard className="w-4 h-4" />
              Subscribe Yearly - ${yearlyPrice}
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-teal-400"></span>
            No commitment • Cancel anytime
            <span className="inline-block w-1 h-1 rounded-full bg-teal-400"></span>
            Secure payment
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          planType={selectedPlan || 'monthly'}
          amount={selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}