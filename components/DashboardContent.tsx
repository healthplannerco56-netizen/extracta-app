'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, LogOut, Database, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Study } from '@/lib/types'
import ExtractorApp from '@/components/ExtractorApp'

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [showExtractor, setShowExtractor] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)

      const { data } = await supabase
        .from('studies')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setStudies(data ?? [])
      setLoading(false)
    }
    init()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <Loader2 className="animate-spin text-white/40" size={32} />
      </div>
    )
  }

  if (showExtractor) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <Database className="text-white/60" size={20} />
            <span className="font-serif text-lg italic text-white">Datalens</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/40">{user?.email}</span>
            <button
              onClick={() => setShowExtractor(false)}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/20 hover:text-white"
            >
              Back
            </button>
          </div>
        </header>
        <ExtractorApp onDone={() => setShowExtractor(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <Database className="text-white/60" size={20} />
          <span className="font-serif text-lg italic text-white">Datalens</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl italic text-white">My studies</h1>
            <p className="mt-1 text-sm text-white/40">
              {studies.length} stud{studies.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
          <button
            onClick={() => setShowExtractor(true)}
            className="liquid-glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-white transition-colors hover:text-white/80"
          >
            <Plus size={16} />
            New extraction
          </button>
        </div>

        {studies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
            <FileText className="mb-4 text-white/20" size={48} />
            <p className="text-sm text-white/30">No studies yet</p>
            <p className="mb-6 text-sm text-white/20">
              Upload a PDF to start your first extraction
            </p>
            <button
              onClick={() => setShowExtractor(true)}
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white transition-colors hover:text-white/80"
            >
              Upload your first PDF
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <button
                key={study.id}
                onClick={() => setShowExtractor(true)}
                className="liquid-glass rounded-2xl p-5 text-left transition-all hover:bg-white/[0.03]"
              >
                <FileText className="mb-3 text-white/30" size={24} />
                <h3 className="mb-1 text-sm font-medium text-white/80">
                  {study.title}
                </h3>
                <p className="text-xs text-white/30">
                  {study.status === 'done'
                    ? 'Completed'
                    : study.status === 'processing'
                      ? 'Processing...'
                      : 'Pending'}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
