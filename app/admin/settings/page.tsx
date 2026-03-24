'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, DollarSign, Heart, Trophy, Settings as SettingsIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    platformName: 'Golf4Good',
    monthlyPrice: 10,
    yearlyPrice: 100,
    charityMinPercentage: 10,
    emailNotifications: true,
    autoDrawEnabled: true
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
    setLoading(false)
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== 'admin@example.com') {
      router.push('/dashboard')
    }
  }

  async function saveSettings() {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Settings saved!')
    setSaving(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <ArrowLeft className="w-6 h-6 text-white hover:text-teal-400" />
            </Link>
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <SettingsIcon className="w-5 h-5 text-teal-400" />
              <h2 className="text-xl font-semibold text-white">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Enable Email Notifications
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.autoDrawEnabled}
                    onChange={(e) => setSettings({ ...settings, autoDrawEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Auto-run Monthly Draws
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-teal-400" />
              <h2 className="text-xl font-semibold text-white">Subscription Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Monthly Price ($)</label>
                <input
                  type="number"
                  value={settings.monthlyPrice}
                  onChange={(e) => setSettings({ ...settings, monthlyPrice: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Yearly Price ($)</label>
                <input
                  type="number"
                  value={settings.yearlyPrice}
                  onChange={(e) => setSettings({ ...settings, yearlyPrice: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Minimum Charity Contribution (%)</label>
                <input
                  type="number"
                  value={settings.charityMinPercentage}
                  onChange={(e) => setSettings({ ...settings, charityMinPercentage: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}