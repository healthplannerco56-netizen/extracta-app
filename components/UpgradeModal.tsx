'use client'

interface UpgradeModalProps {
  onClose: () => void
  reason: 'pdf_limit' | 'extraction_limit'
}

export default function UpgradeModal({ onClose, reason }: UpgradeModalProps) {
  const CHECKOUT_URL = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || '#'

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  }

  const cardStyle: React.CSSProperties = {
    background: '#0f0f0f',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    margin: '20px',
    textAlign: 'center',
  }

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer' }}
        >×</button>

        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔬</div>

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', marginBottom: '8px' }}>
          {reason === 'pdf_limit' ? 'Upgrade for more PDFs' : 'Monthly limit reached'}
        </h2>

        <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          {reason === 'pdf_limit'
            ? 'Free plan supports up to 3 PDFs per run. Upgrade to Pro to process up to 20 PDFs at once.'
            : 'You\'ve used all 10 free extractions this month. Upgrade to Pro for unlimited extractions.'}
        </p>

        {/* Plan comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '16px' }}>
            <div style={{ color: '#666', fontSize: '11px', letterSpacing: '0.08em', marginBottom: '8px' }}>FREE</div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>$0</div>
            <div style={{ color: '#888', fontSize: '12px', lineHeight: '1.8' }}>
              3 PDFs / run<br />
              10 extractions / mo<br />
              All 14 fields
            </div>
          </div>
          <div style={{ background: '#1a1a0a', border: '1px solid #c8a97e', borderRadius: '6px', padding: '16px' }}>
            <div style={{ color: '#c8a97e', fontSize: '11px', letterSpacing: '0.08em', marginBottom: '8px' }}>PRO</div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>$9<span style={{ fontSize: '12px', color: '#888' }}>/mo</span></div>
            <div style={{ color: '#888', fontSize: '12px', lineHeight: '1.8' }}>
              20 PDFs / run<br />
              Unlimited extractions<br />
              All 14 fields
            </div>
          </div>
        </div>

        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', width: '100%', padding: '14px',
            background: '#c8a97e', border: 'none', borderRadius: '4px',
            color: '#000', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', textDecoration: 'none',
            boxSizing: 'border-box', marginBottom: '12px'
          }}
        >
          Upgrade to Pro — $9/month
        </a>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer' }}
        >
          Continue with free plan
        </button>
      </div>
    </div>
  )
}
