'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleUpgrade = async () => {
    if (!user) { router.push('/'); return }
    const res = await fetch('/api/lemonsqueezy/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] relative overflow-hidden">
      {/* Wavy background — same as homepage */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <p className="text-xs tracking-widest uppercase text-gray-500 mb-4">— Pricing</p>
        <h1 className="text-5xl md:text-6xl font-bold font-serif mb-4 leading-tight">
          Simple, honest<br />pricing.
        </h1>
        <p className="text-gray-600 text-lg mb-16 max-w-md">
          Start free. Upgrade when you need to extract at scale.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white/60 backdrop-blur border border-gray-200 rounded-2xl p-8 flex flex-col">
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-6">Free</p>
            <div className="font-serif text-5xl font-bold mb-1">$0</div>
            <p className="text-gray-400 text-sm mb-8">forever</p>
            <ul className="flex flex-col gap-3 text-gray-700 flex-1 mb-8">
              {['3 PDFs per extraction', 'Basic fields', 'CSV export'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-gray-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <button disabled
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-400 font-serif text-base cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 flex flex-col">
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-6">Pro</p>
            <div className="font-serif text-5xl font-bold mb-1">$9</div>
            <p className="text-gray-400 text-sm mb-8">per month</p>
            <ul className="flex flex-col gap-3 text-gray-300 flex-1 mb-8">
              {['20 PDFs per extraction', 'All fields', 'CSV + Excel export', 'Priority support'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-gray-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={handleUpgrade}
              className="w-full py-3 rounded-xl bg-[#8B2500] hover:bg-[#7a2000] transition text-white font-serif text-base">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
