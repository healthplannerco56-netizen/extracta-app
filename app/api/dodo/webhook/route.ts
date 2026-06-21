export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET

    if (!secret) {
      return NextResponse.json(
        { error: 'Dodo Payments not configured' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const eventType = body.event_type as string

    const supabase = await createServiceSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    if (eventType === 'subscription.active' || eventType === 'subscription.updated') {
      const customerEmail = body.data?.customer?.email

      if (customerEmail) {
        await supabase
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('email', customerEmail)
      }
    }

    if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
      const customerEmail = body.data?.customer?.email

      if (customerEmail) {
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('email', customerEmail)
      }
    }

    if (eventType === 'payment.succeeded') {
      const customerEmail = body.data?.customer?.email

      if (customerEmail) {
        await supabase
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('email', customerEmail)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
