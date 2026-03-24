'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Trophy, Target, ArrowRight, Gift, Users, ChevronRight, Sparkles, Shield, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-teal-500" />
              <span className="text-xl font-semibold text-white">Golf4Good</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="text-gray-300 hover:text-white text-sm transition">Sign In</button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs text-gray-400">Making Golf Meaningful</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Play Golf.{' '}
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Change Lives.
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Subscribe monthly, track your Stableford scores, win monthly prizes, and support causes you care about.
          </p>
          <Link href="/auth/signup">
            <button className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-medium transition group">
              Start Your Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-16 text-center">
          <div>
            <p className="text-2xl font-bold text-white">$10+</p>
            <p className="text-xs text-gray-500 mt-1">Monthly Subscription</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">40%</p>
            <p className="text-xs text-gray-500 mt-1">To Prize Pool</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">10%</p>
            <p className="text-xs text-gray-500 mt-1">To Your Charity</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white/5 border-y border-white/10 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <p className="text-gray-400 mt-2">Simple steps to start making an impact</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: Heart, title: 'Subscribe & Choose', desc: 'Pick monthly or yearly plan, select a charity you want to support' },
              { step: '02', icon: Target, title: 'Record Scores', desc: 'Enter your Stableford scores (1-45). Last 5 scores automatically tracked' },
              { step: '03', icon: Trophy, title: 'Win & Give Back', desc: 'Participate in monthly draws while your charity receives donations' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition group">
                <div className="text-4xl font-bold text-white/20 mb-4">{item.step}</div>
                <item.icon className="w-8 h-8 text-teal-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Monthly Prize Pool</h2>
          <p className="text-gray-400 mb-10">Every subscription contributes. Here's how it's distributed:</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { percent: '40%', title: '5-Number Match', desc: 'Jackpot Rollover' },
              { percent: '35%', title: '4-Number Match', desc: '' },
              { percent: '25%', title: '3-Number Match', desc: '' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-5">
                <p className="text-3xl font-bold text-teal-400 mb-1">{item.percent}</p>
                <p className="text-white font-medium">{item.title}</p>
                {item.desc && <p className="text-gray-500 text-xs mt-1">{item.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charities */}
      <section className="bg-white/5 border-y border-white/10 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Partner Charities</h2>
            <p className="text-gray-400 mt-2">Causes you can support through Golf4Good</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Golf For All', desc: 'Making golf accessible to everyone regardless of background or ability.', impact: '2,500+ children introduced' },
              { name: 'Green Earth Initiative', desc: 'Preserving golf courses as natural habitats for wildlife.', impact: '50+ courses certified' },
              { name: 'Youth Golf Foundation', desc: 'Developing young talent through scholarships and coaching programs.', impact: '200+ scholarships awarded' }
            ].map((charity, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition">
                <h3 className="text-lg font-semibold text-white mb-2">{charity.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{charity.desc}</p>
                <div className="flex items-center gap-2 text-teal-400 text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>{charity.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to make a difference?</h3>
          <p className="text-gray-400 mb-6">Join thousands of golfers giving back to the community</p>
          <Link href="/auth/signup">
            <button className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-medium transition group">
              Get Started
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">© 2024 Golf4Good. Play Golf, Change Lives.</p>
        </div>
      </footer>
    </div>
  )
}