'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/lib/types'
import type { Plan } from '@/lib/types'

export function useUsage(userId: string | undefined, plan: Plan = 'free') {
  const [used, setUsed] = useState(0)
  const [loading, setLoading] = useState(true)

  const limit = PLAN_LIMITS[plan].extractionsPerMonth
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used)
  const canExtract = remaining > 0

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchUsage(userId)
  }, [userId])

  const fetchUsage = async (uid: string) => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('extractions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .gte('created_at', start.toISOString())

    setUsed(count ?? 0)
    setLoading(false)
  }

  const recordExtraction = async (uid: string, fileCount: number, fieldsCount: number) => {
    await supabase.from('extractions').insert({
      user_id: uid,
      file_count: fileCount,
      fields_count: fieldsCount,
    })
    setUsed(prev => prev + 1)
  }

  return { used, limit, remaining, canExtract, loading, recordExtraction }
}
