// File: app/api/extract/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PLAN_LIMITS } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  
  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Fetch profile & Check Limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan ?? 'free'
    const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.extractionsPerMonth ?? 5

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
          { error: `Limit of ${limit} extractions/month reached.` },
          { status: 403 }
        )
      }
    }

    // 3. Extract data via AI
    const { pdfText, fields } = await req.json()

    const prompt = `Fields to extract: ${fields}\n\nPaper text: ${pdfText}`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // Faster & more reliable for formatting
      max_tokens: 4000,
      system: "You are a meta-analysis data extraction assistant. Return ONLY valid JSON with the exact field keys requested. If a field cannot be found, use null. No markdown, no explanation.",
      messages: [{ role: 'user', content: prompt }],
    })

    // 4. Parse JSON reliably
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("AI failed to return a JSON object")
    }
    
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))

    // 5. Record usage in database
    await supabase.from('extractions').insert({
      user_id: user.id,
      file_count: 1,
      fields_count: Object.keys(parsed).length,
    })

    return NextResponse.json(parsed)

  } catch (error: any) {
    console.error('Extraction Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
