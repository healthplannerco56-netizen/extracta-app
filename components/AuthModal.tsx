'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  mode: 'signin' | 'signup'
  onClose: () => void
  onSwitchMode: () => void
}

export default function AuthModal({
  isOpen,
  mode,
  onClose,
  onSwitchMode,
}: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="liquid-glass w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl italic text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 transition-colors hover:text-white/80"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
          />

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={14} />}
            {mode === 'signin' ? 'Sign In' : 'Create account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <Globe size={16} />
          Continue with Google
        </button>

        <p className="mt-4 text-center text-xs text-white/30">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={onSwitchMode}
            className="text-white/60 underline transition-colors hover:text-white/90"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
