import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@supabase/ssr'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check using cookies from request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll() {
            // No-op for API routes
          },
        },
      }
    )

   const authHeader = req.headers.get('Authorization')
   const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
   const { data: { user}, error } = await supabase.auth.getUser(token)
    // 2. Check monthly usage limit
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan ?? 'free'
    const limit = plan === 'pro' ? Infinity : 10

    if (limit !== Infinity) {
      const { count } = await supabase
        .from('extractions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())

      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: `Free plan limit of ${limit} extractions/month reached. Upgrade to Pro.` },
          { status: 403 }
        )
      }
    }

    // 3. Extract
    const { pdfText, fields } = await req.json()

    if (!pdfText || !fields) {
      return NextResponse.json({ error: 'Missing pdfText or fields' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: 'You are a data extraction engine. You always output valid JSON only.',
      messages: [
        {
          role: 'user',
          content: `Extract the following fields from this research paper. Return ONLY a valid JSON object. Use null for missing fields.

Fields:
${fields}

Paper text:
${pdfText}`
        }
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    let parsed: Record<string, string>
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 422 })
    }

    // 4. Record usage
    await supabase.from('extractions').insert({
      user_id: user.id,
      file_count: 1,
      fields_count: Object.keys(parsed).length,
    })

    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('Anthropic API Error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: err.status || 500 }
    )
  }
}
