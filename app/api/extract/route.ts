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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: 'You are a data extraction engine. You always output valid JSON only.',
      messages: [
        {
          role: 'user',
     content: `You are extracting structured data from a research paper for meta-analysis.

Return ONLY a valid JSON object with these exact field keys. Use null for any field not found.

CRITICAL RULES:
- effect_size: Return the full value including the number e.g. "RR 0.99" or "OR 1.24" or "MD -0.31". Never return just the measure type alone.
- confidence_interval: This is MANDATORY. It must never be null if effect_size is not null. 
  Look for patterns like "(95% CI: 0.80-1.21)" or "[0.46, 1.39]" immediately after each RR/OR/MD value. 
  Return all CIs as a semicolon-separated list matching the order of effect_size values 
  e.g. "0.80-1.21; 0.46-1.39; 0.19-0.73". 
  If you found RR values, you MUST find their confidence intervals in the same sentence or table row.
- p_value: Return the numeric value of the PRIMARY outcome p-value e.g. "0.04" or "<0.001". Never return null if a p-value exists anywhere in the paper.
- n_treatment: Return the number of participants in the intervention/treatment arm as an integer.
- n_control: Return the number of participants in the control/placebo arm as an integer.
- events_treatment: Return the number of events/outcomes that occurred in the treatment arm as an integer.
- events_control: Return the number of events/outcomes that occurred in the control arm as an integer.
- mean_treatment: Return the mean outcome value in the treatment arm as a number.
- mean_control: Return the mean outcome value in the control arm as a number.
- sd_treatment: Return the standard deviation in the treatment arm as a number.
- sd_control: Return the standard deviation in the control arm as a number.
- rob: Return exactly one of: "Low" / "Some concerns" / "High" / "Unclear".
- grade: Return exactly one of: "High" / "Moderate" / "Low" / "Very Low".
- authors: Return a comma-separated string of author surnames e.g. "Smith, Jones, Ali".
- year: Return as an integer e.g. 2024.
- For all other fields: extract the most relevant value as a concise string.
- confidence_interval: Always extract alongside effect_size. 
  If effect_size is "RR 0.99", confidence_interval should be 
  "0.80-1.21". Return all CIs as a matching list if multiple 
  e.g. "0.80-1.21; 0.46-1.39; 0.19-0.73".
- p_value: Return the p-value for the PRIMARY outcome 
  (first/main result reported), not secondary outcomes.
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
