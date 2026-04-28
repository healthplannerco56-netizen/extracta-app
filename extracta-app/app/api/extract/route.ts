import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(request: NextRequest) {
  try {
    const { pdfText, fields, apiKey } = await request.json()

    if (!pdfText || !fields || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: pdfText, fields, apiKey' },
        { status: 400 }
      )
    }

    if (!apiKey.startsWith('sk-ant')) {
      return NextResponse.json(
        { error: 'Invalid API key format. Key should start with sk-ant-' },
        { status: 400 }
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
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Anthropic API error:', err)
      return NextResponse.json(
        { error: err.error?.message || 'Anthropic API error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const text = data.content?.map((b: any) => b.text || '').join('') || ''
    const clean = text.replace(/```json|```/g, '').trim()

    try {
      const parsed = JSON.parse(clean)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: clean },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Extract route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}