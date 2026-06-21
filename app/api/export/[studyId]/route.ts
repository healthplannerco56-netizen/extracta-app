export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(
  _request: Request,
  { params }: { params: { studyId: string } },
) {
  try {
    const supabase = await createServerSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studyId } = params

    const { data: study } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .eq('user_id', user.id)
      .single()

    if (!study) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: extractions } = await supabase
      .from('extractions')
      .select('*')
      .eq('study_id', studyId)

    if (!extractions) {
      return NextResponse.json({ error: 'No extractions found' }, { status: 404 })
    }

    const format = _request.headers.get('accept')?.includes('text/csv')
      ? 'csv'
      : 'json'

    if (format === 'csv') {
      const headers = extractions.map((e) => e.field_name).join(',')
      const values = extractions.map((e) => `"${(e.field_value ?? '').replace(/"/g, '""')}"`).join(',')
      const csv = `${headers}\n${values}`

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${study.title}.csv"`,
        },
      })
    }

    const result: Record<string, any> = {}
    extractions.forEach((e) => {
      result[e.field_name] = {
        value: e.field_value,
        confidence: e.confidence,
        status: e.status,
      }
    })

    return NextResponse.json({ study: study.title, extractions: result })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
