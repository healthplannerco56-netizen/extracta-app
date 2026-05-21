'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import AuthModal from '@/components/AuthModal'

export default function AuthButton() {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      )}
      <button
        onClick={() => user ? supabase.auth.signOut() : setShowAuth(true)}
        style={{
          padding: '7px 16px',
          background: user ? 'transparent' : '#b5451b',
          border: user ? '1px solid #ccc' : 'none',
          borderRadius: '4px',
          color: user ? '#666' : '#fff',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          letterSpacing: '0.05em'
        }}
      >
        {user ? 'Sign Out' : 'Sign In'}
      </button>
    </>
  )
}
