'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['3 PDFs per extraction', 'Basic fields', 'CSV export'],
    cta: 'Current Plan',
    disabled: true,
    variantId: null,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    features: ['20 PDFs per extraction', 'All fields', 'CSV + Excel export', 'Priority support'],
    cta: 'Upgrade to Pro',
    disabled: false,
    variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID,
  },
]

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
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20">
      <h1 className="text-4xl font-bold mb-2 text-center">Simple Pricing</h1>
      <p className="text-gray-500 mb-12 text-center">Upgrade to extract more, faster.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {PLANS.map((plan) => (
          <div key={plan.name} className="border rounded-2xl p-8 flex flex-col gap-4 shadow-sm">
            <h2 className="text-2xl font-bold">{plan.name}</h2>
            <div className="text-4xl font-black">{plan.price} <span className="text-base font-normal text-gray-400">/ {plan.period}</span></div>
            <ul className="flex flex-col gap-2 text-gray-600 flex-1">
              {plan.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
            <button
              onClick={plan.disabled ? undefined : handleUpgrade}
              disabled={plan.disabled}
              className={`mt-4 rounded-xl py-3 font-semibold text-white transition
                ${plan.disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
