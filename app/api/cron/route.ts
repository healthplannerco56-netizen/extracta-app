export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServiceSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { data: pendingStudies, error: fetchError } = await supabase
      .from('studies')
      .select('id')
      .eq('status', 'pending')
      .limit(5)

    if (fetchError) throw fetchError

    for (const study of pendingStudies ?? []) {
      await supabase
        .from('studies')
        .update({ status: 'processing' })
        .eq('id', study.id)
    }

    return NextResponse.json({
      processed: pendingStudies?.length ?? 0,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
