import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(rawBody)
  const digest = hmac.digest('hex')

  if (signature !== digest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload.meta?.event_name
  const userEmail = payload.data?.attributes?.user_email

  if ([
    'subscription_created',
    'subscription_resumed', 
    'subscription_unpaused',
  ].includes(eventName)) {
    await supabaseAdmin
      .from('profiles')
      .update({ plan: 'pro' })
      .eq('email', userEmail)
  }

  if ([
    'subscription_cancelled',
    'subscription_expired',
    'subscription_paused',
  ].includes(eventName)) {
    await supabaseAdmin
      .from('profiles')
      .update({ plan: 'free' })
      .eq('email', userEmail)
  }

  return NextResponse.json({ received: true })
}
