export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabase } from '@/lib/supabase-server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `You are a research data extraction assistant. Given the text of a research paper, extract the requested fields as structured JSON. Return ONLY valid JSON with no additional text. If a field cannot be found, use null.`

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { studyId, text, fields } = await request.json()

    if (!studyId || !text || !fields) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const fieldsPrompt = fields
      .map(
        (f: any) =>
          `- "${f.name}" (${f.type}): ${f.prompt}`,
      )
      .join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Extract the following fields from this research paper text:\n\n${fieldsPrompt}\n\nPaper text:\n${text.slice(0, 15000)}`,
        },
      ],
    })

    const content = message.content[0]
    let parsed
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
        content.text.match(/{[\s\S]*}/)
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content.text
      parsed = JSON.parse(jsonStr)
    } else {
      throw new Error('Unexpected response type')
    }

    // Store extractions
    const extractionRows = fields.map((field: any) => ({
      study_id: studyId,
      field_name: field.name,
      field_value: String(parsed[field.name] ?? ''),
      confidence: parsed[`${field.name}_confidence`] ?? 0.5,
      status: parsed[field.name] ? 'extracted' : 'flagged',
    }))

    const { error: dbError } = await supabase.from('extractions').insert(extractionRows)
    if (dbError) throw dbError

    await supabase
      .from('studies')
      .update({ status: 'done' })
      .eq('id', studyId)

    return NextResponse.json({ data: parsed })
  } catch (error) {
    console.error('Extract error:', error)
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
