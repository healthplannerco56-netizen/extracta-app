import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { pdfText, fields } = await req.json()

    // 1. Validation check
    if (!pdfText || !fields) {
      return NextResponse.json({ error: 'Missing pdfText or fields' }, { status: 400 })
    }

    // 2. Structured Prompting
    // Using XML-style tags helps Claude distinguish between instructions and data
    const prompt = `You are a specialized data extraction assistant.
    
<fields_to_extract>
${JSON.stringify(fields, null, 2)}
</fields_to_extract>

<research_paper_text>
${pdfText}
</research_paper_text>

Return ONLY a valid JSON object. If a value is missing, use null. No preamble or post-analysis.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000, // Research extractions can be lengthy
      messages: [{ role: 'user', content: prompt }],
      // Use 'system' for persona to keep the user prompt focused on the data
      system: "You are a data extraction engine. You always output valid JSON."
    })

    const responseContent = message.content[0].type === 'text' ? message.content[0].text : ''

    // 3. Robust JSON Parsing
    try {
      // Regex handles cases where the model ignores instructions and includes markdown blocks
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      const cleanJson = jsonMatch ? jsonMatch[0] : responseContent
      const parsed = JSON.parse(cleanJson)
      
      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error('Extraction Parse Error:', responseContent)
      return NextResponse.json({ error: 'AI returned invalid JSON format' }, { status: 422 })
    }

  } catch (err: any) {
    console.error('Anthropic API Error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' }, 
      { status: err.status || 500 }
    )
  }
}
