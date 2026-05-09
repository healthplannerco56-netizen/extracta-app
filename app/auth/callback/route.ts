import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // "next" is a common pattern to redirect users back to the page 
  // they were on before they were asked to sign in.
  const next = searchParams.get('next') ?? '/'

  if (code) {
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Success! Send them to the requested page or dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, send them to an error page instead of 
  // looping them back to the home page in confusion.
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
