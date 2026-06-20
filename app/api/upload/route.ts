export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(path, file, { contentType: 'application/pdf' })

    if (uploadError) throw uploadError

    const { data: study, error: dbError } = await supabase
      .from('studies')
      .insert({
        user_id: user.id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        status: 'pending',
        pdf_path: path,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ study })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
