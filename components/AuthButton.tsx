'use client'

import { createClient } from '@/lib/supabase'

interface AuthButtonProps {
  onSignIn: () => void
}

export default function AuthButton({ onSignIn }: AuthButtonProps) {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div>
      <button
        onClick={onSignIn}
        className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
      >
        Sign In
      </button>
      <button
        onClick={handleSignOut}
        className="text-sm text-white/40 transition-colors hover:text-white/80"
      >
        Sign Out
      </button>
    </div>
  )
}
