// ... existing imports

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { pdfText, fields } = await req.json()

    // 1. Get Plan & Usage (Consolidated query)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, extractions(count)') // If your schema allows counting via join
      .eq('id', user.id)
      .single()

    // ... (Keep your existing usage check logic here)

    // 2. AI Call with explicit System Prompt
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229', // Note: Check latest model strings
      max_tokens: 2000,
      system: "You are a data extraction engine. Return ONLY JSON.", 
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // 3. Robust JSON Extraction
    const jsonStart = rawText.indexOf('{')
    const jsonEnd = rawText.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("AI failed to return a JSON object")
    }
    
    const cleanJson = rawText.slice(jsonStart, jsonEnd + 1)
    const parsed = JSON.parse(cleanJson)

    // 4. Atomic Usage Record
    const { error: insertError } = await supabase.from('extractions').insert({
      user_id: user.id,
      file_count: 1,
      fields_count: Object.keys(parsed).length,
      // Store metadata like model used for internal cost tracking
      metadata: { model: 'claude-opus' } 
    })

    if (insertError) console.error("Usage logging failed:", insertError)

    return NextResponse.json(parsed)

  } catch (error: any) {
    console.error('Extraction Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
