'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, Database } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      fetch('/api/lemonsqueezy/checkout', { method: 'POST' })
        .then((r) => r.json())
        .then((d) => setCheckoutUrl(d.url ?? ''))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="liquid-glass w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-white/60" />
            <h2 className="font-serif text-xl italic text-white">Upgrade to Pro</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 transition-colors hover:text-white/80"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="mb-6 space-y-3 text-sm text-white/60">
          <li className="flex items-center gap-2">✓ Unlimited extractions</li>
          <li className="flex items-center gap-2">✓ 20 PDFs per run</li>
          <li className="flex items-center gap-2">✓ Priority support</li>
          <li className="flex items-center gap-2">✓ Advanced extraction fields</li>
        </ul>

        <div className="mb-6 text-center">
          <span className="text-3xl text-white">$9</span>
          <span className="ml-1 text-sm text-white/40">/month</span>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-white/40" size={20} />
          </div>
        ) : checkoutUrl ? (
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-white/10 py-2.5 text-center text-sm text-white transition-colors hover:bg-white/20"
          >
            Continue to checkout
          </a>
        ) : (
          <p className="text-center text-xs text-white/30">
            LemonSqueezy not configured
          </p>
        )}
      </div>
    </div>
  )
}
