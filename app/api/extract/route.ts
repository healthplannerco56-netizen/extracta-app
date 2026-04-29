import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(request: NextRequest) {
  try {
    const { pdfText, fields } = await request.json()

    if (!pdfText || !fields) {
      return NextResponse.json(
        { error: 'Missing required fields: pdfText, fields' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing API key' },
        { status: 500 }
      )
    }

    const prompt = `You are a meta-analysis data extraction assistant. Extract the following fields from this research paper text. Return ONLY valid JSON with the exact field keys listed. If a field cannot be found, use null.

Fields to extract:
${fields}

Paper text:
${pdfText}

Return ONLY a JSON object with these exact keys. No markdown, no explanation.`

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json(
        { error: err.error?.message || 'Anthropic API error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const text = data.content?.map((b: any) => b.text || '').join('').trim()
    const clean = text.replace(/```json|```/g, '').trim()
    return NextResponse.json(JSON.parse(clean))

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
