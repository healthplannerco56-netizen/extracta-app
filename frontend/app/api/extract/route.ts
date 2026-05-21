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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: 'You are a data extraction engine. You always output valid JSON only.',
      messages: [
        {
          role: 'user',
 content: `You are a precise data extraction engine for academic meta-analysis.

Extract fields from the paper below. Return ONLY a valid JSON object. Use null only if the value is genuinely absent from the entire paper.

EXTRACTION RULES:
- authors: Comma-separated surnames e.g. "Smith, Jones, Ali"
- year: Integer e.g. 2026
- effect_size: Full value with number e.g. "RR 0.99" — never just "RR". If multiple outcomes, separate with " | " e.g. "RR 0.99 | RR 0.80 | RR 0.37"
- confidence_interval: The 95% CI numbers for each effect size in same order e.g. "0.80-1.21 | 0.46-1.39 | 0.19-0.73". Look for parentheses like (95% CI: x-y) next to each RR/OR value. NEVER return null if effect_size is not null.
- p_value: The p-value of the PRIMARY outcome only, as a single number e.g. "0.90"
- n_treatment: Participant count in intervention arm as integer
- n_control: Participant count in control arm as integer  
- events_treatment: Event count in treatment arm as integer
- events_control: Event count in control arm as integer
- rob: Exactly one of: "Low" | "Some concerns" | "High" | "Unclear"
- grade: Exactly one of: "High" | "Moderate" | "Low" | "Very Low"
- subgroup: Any subgroup analyses mentioned e.g. "Age, region"
- funding: Funding source if mentioned, else null

Fields to extract:
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
