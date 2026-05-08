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
    <>
      <nav>
        <div className="logo">Extracta<span>.</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="nav-badge">BETA v0.1</span>
          <a href="/pricing" className="btn btn-ghost" style={{ fontSize: '12px' }}>Upgrade</a>
        </div>
      </nav>

      <div className="hero">
        <p className="hero-label">Pricing</p>
        <h1>Simple, honest<br />pricing.</h1>
        <p className="hero-sub">Start free. Upgrade when you need to extract at scale.</p>
      </div>

      <div className="app-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '720px' }}>

          {/* Free */}
          <div className="app-card" style={{ padding: '32px' }}>
            <p className="section-label">Free</p>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '52px', lineHeight: 1, marginBottom: '4px' }}>$0</div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '28px' }}>forever</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {['3 PDFs per extraction', 'Basic fields', 'CSV export'].map(f => (
                <div key={f} style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent2)' }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button disabled className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', opacity: 0.5 }}>
              Current Plan
            </button>
          </div>

          {/* Pro */}
          <div className="app-card" style={{ padding: '32px', background: 'var(--ink)', borderColor: 'var(--ink)' }}>
            <p className="section-label" style={{ color: 'var(--muted)' }}>Pro</p>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '52px', lineHeight: 1, color: 'var(--paper)', marginBottom: '4px' }}>$9</div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '28px' }}>per month</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {['20 PDFs per extraction', 'All fields', 'CSV + Excel export', 'Priority support'].map(f => (
                <div key={f} style={{ fontSize: '13px', color: '#a09a92', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button onClick={handleUpgrade} className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>
              Upgrade to Pro
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
