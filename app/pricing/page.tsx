'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Database, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '10 extractions / month',
      '3 PDFs per run',
      'CSV & JSON export',
      'Email support',
    ],
    cta: 'Get started',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    features: [
      'Unlimited extractions',
      '20 PDFs per run',
      'CSV & JSON export',
      'Priority support',
      'Advanced extraction fields',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
]

export default function PricingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()
  const supabase = createClient()

  const handleCta = async (plan: string) => {
    if (plan === 'Pro') {
      const { error } = await supabase.auth.getSession()
      if (error || !(await supabase.auth.getSession()).data.session) {
        setAuthMode('signin')
        setAuthOpen(true)
        return
      }

      const res = await fetch('/api/dodo/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } else {
      setAuthMode('signup')
      setAuthOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/80"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2 text-white">
          <Database size={18} />
          <span className="font-serif text-lg italic">Datalens</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl italic text-white">Pricing</h1>
          <p className="mt-2 text-sm text-white/40">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`liquid-glass rounded-2xl p-8 ${
                plan.popular ? 'ring-1 ring-white/20' : ''
              }`}
            >
              {plan.popular && (
                <span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                  Most popular
                </span>
              )}
              <h2 className="font-serif text-2xl italic text-white">
                {plan.name}
              </h2>
              <div className="mb-6 mt-2">
                <span className="text-3xl text-white">{plan.price}</span>
                <span className="ml-1 text-sm text-white/40">{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={14} className="text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCta(plan.name)}
                className={`w-full rounded-full py-2.5 text-sm transition-colors ${
                  plan.popular
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'border border-white/10 text-white/60 hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </main>

      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={() =>
          setAuthMode((m) => (m === 'signin' ? 'signup' : 'signin'))
        }
      />
    </div>
  )
}
