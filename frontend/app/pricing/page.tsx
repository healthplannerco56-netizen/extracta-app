'use client'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PricingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async () => {
    if (loading) return
    if (!user) {
      router.push('/auth/login?next=/pricing')
      return
    }

    try {
      setUpgrading(true)
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })

      if (!res.ok) throw new Error('Checkout request failed')

      const { url } = await res.json()
      if (!url) throw new Error('No checkout URL returned')

      window.location.href = url
    } catch (err) {
      console.error('Upgrade error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div>
      <nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.back()}
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: '16px', lineHeight: '1' }}
          >
            ✕
          </button>
          <div className="logo">Extracta<span>.</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="nav-badge">BETA v0.1</span>
        </div>
      </nav>

      <div className="hero">
        <p className="hero-label">Pricing</p>
        <h1>Simple, honest<br />pricing.</h1>
        <p className="hero-sub">Start free. Upgrade when you need to extract at scale.</p>
      </div>

      <div className="app-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '720px' }}>
          
          {/* Free Plan */}
          <div className="app-card" style={{ padding: '32px' }}>
            <p className="section-label">Free</p>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '52px', lineHeight: '1', marginBottom: '4px' }}>$0</div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '28px' }}>forever</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {['3 PDFs per extraction', 'Basic fields', 'CSV export'].map(f => (
                <div key={f} style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent2)' }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button
              disabled
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', opacity: 0.5 }}
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="app-card" style={{ padding: '32px', background: 'var(--ink)', borderColor: 'var(--ink)' }}>
            <p className="section-label" style={{ color: 'var(--muted)' }}>Pro</p>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '52px', lineHeight: '1', color: 'var(--paper)', marginBottom: '4px' }}>$9</div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '28px' }}>per month</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {['20 PDFs per extraction', 'All fields', 'CSV + Excel export', 'Priority support'].map(f => (
                <div key={f} style={{ fontSize: '13px', color: '#a09a92', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading || upgrading}
              className="btn btn-accent"
              style={{ width: '100%', justifyContent: 'center', opacity: loading || upgrading ? 0.7 : 1 }}
            >
              {upgrading ? 'Redirecting...' : loading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
