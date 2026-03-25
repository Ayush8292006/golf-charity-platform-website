'use client'

import { useState } from 'react'
import { X, CreditCard, Lock, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planType: 'monthly' | 'yearly'
  amount: number
  onSuccess: () => void
}

export default function PaymentModal({ isOpen, onClose, planType, amount, onSuccess }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const parts = []
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substr(i, 4))
    }
    return parts.join(' ')
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter valid 16-digit card number')
      return
    }
    if (!expiry || expiry.length !== 5) {
      toast.error('Please enter valid expiry date (MM/YY)')
      return
    }
    if (!cvc || cvc.length < 3) {
      toast.error('Please enter valid CVC')
      return
    }
    if (!name) {
      toast.error('Please enter cardholder name')
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Payment successful!')
    onSuccess()
    onClose()
    setLoading(false)
  }

  const fillDummyCard = () => {
    setCardNumber('4242 4242 4242 4242')
    setExpiry('12/28')
    setCvc('123')
    setName('TEST USER')
    toast.success('Dummy card details filled!')
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full border border-white/10">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
            <p className="text-gray-400 text-sm mt-1">{planType === 'monthly' ? 'Monthly Subscription' : 'Yearly Subscription'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 bg-white/5 border-b border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Amount</span>
            <span className="text-3xl font-bold text-teal-500">${amount}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">Card Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">Expiry (MM/YY)</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="12/28"
                maxLength={5}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Cardholder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="JOHN DOE"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <button type="button" onClick={fillDummyCard} className="text-sm text-teal-400 hover:text-teal-300 flex items-center justify-center gap-1 w-full">
            <Check className="w-4 h-4" /> Use dummy card (4242 4242 4242 4242)
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
            <Lock className="w-3 h-3" /> Demo Mode - No real charge
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 mt-4">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Pay $${amount}`
            )}
          </button>
        </form>
      </div>
    </div>
  )
}