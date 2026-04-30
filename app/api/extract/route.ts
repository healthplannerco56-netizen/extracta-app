Import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PLAN_LIMITS } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Fetch profile for plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const limit = PLAN_LIMITS[plan as 'free' | 'pro'].extractionsPerMonth

  // 3. Check monthly usage
  if (limit !== Infinity) {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('extractions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', start.toISOString())

    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        { error: `Free plan limit of ${limit} extractions/month reached. Upgrade to Pro for unlimited access.` },
        { status: 403 }
      )
    }
  }

  // 4. Extract
  const { pdfText, fields } = await req.json()

  const prompt = `You are a meta-analysis data extraction assistant. Extract the following fields from this research paper text. Return ONLY valid JSON with the exact field keys listed. If a field cannot be found, use null.

Fields to extract:
${fields}

Paper text:
${pdfText}

Return ONLY a JSON object with these exact keys. No markdown, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed: Record<string, string>
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // 5. Record usage
  await supabase.from('extractions').insert({
    user_id: user.id,
    file_count: 1,
    fields_count: Object.keys(parsed).length,
  })

  return NextResponse.json(parsed)
}
