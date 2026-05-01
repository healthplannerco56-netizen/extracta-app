'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        onSuccess()
        onClose()
      }
    }

    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

return (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 9999, paddingTop: '80px', overflowY: 'auto'
  }}>
      <div style={{
        background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px',
        padding: '40px', width: '100%', maxWidth: '400px', position: 'relative'
     }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer' }}
        >×</button>

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '4px', color: '#fff' }}>
          {mode === 'login' ? 'Sign in to Extracta' : 'Create your account'}
        </h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px' }}>
          {mode === 'login' ? 'Welcome back.' : 'Free — 10 extractions/month.'}
        </p>

        {error && (
          <div style={{ background: '#2a0000', border: '1px solid #660000', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', color: '#ff6b6b', fontSize: '13px' }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: '#002a00', border: '1px solid #006600', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', color: '#6bff6b', fontSize: '13px' }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', letterSpacing: '0.05em' }}>EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@university.edu"
            style={{
              width: '100%', padding: '10px 12px', background: '#1a1a1a',
              border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff',
              fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', letterSpacing: '0.05em' }}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 12px', background: '#1a1a1a',
              border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff',
              fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', background: '#c8a97e',
            border: 'none', borderRadius: '4px', color: '#000',
            fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginBottom: '12px'
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <button
          onClick={handleGoogle}
          style={{
            width: '100%', padding: '12px', background: 'transparent',
            border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff',
            fontSize: '14px', cursor: 'pointer', marginBottom: '20px'
          }}
        >
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#666' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ color: '#c8a97e', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}
