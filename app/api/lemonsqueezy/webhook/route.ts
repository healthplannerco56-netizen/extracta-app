import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  // LemonSqueezy sends the signature as "sha256=<hex>"
  const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(rawBody)
  const digest = hmac.digest('hex')

  const a = Buffer.from(provided, 'hex')
  const b = Buffer.from(digest, 'hex')
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload.meta?.event_name
  const userId = payload.meta?.custom_data?.user_id

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  if ([
    'subscription_created',
    'subscription_resumed',
    'subscription_unpaused',
  ].includes(eventName)) {
    await getSupabaseAdmin()
      .from('profiles')
      .update({ plan: 'pro' })
      .eq('id', userId)
  }

  if ([
    'subscription_cancelled',
    'subscription_expired',
    'subscription_paused',
  ].includes(eventName)) {
    await getSupabaseAdmin()
      .from('profiles')
      .update({ plan: 'free' })
      .eq('id', userId)
  }

  return NextResponse.json({ received: true })
}
