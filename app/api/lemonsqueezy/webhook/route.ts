export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    if (!secret) {
      return NextResponse.json(
        { error: 'LemonSqueezy not configured' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const eventName = body.meta?.event_name

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const supabase = await createServiceSupabase()
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
      }

      const customerEmail =
        body.data?.attributes?.user_email ??
        body.data?.attributes?.customer_email

      if (customerEmail) {
        await supabase
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('email', customerEmail)
      }
    }

    if (eventName === 'subscription_cancelled') {
      const supabase = await createServiceSupabase()
      if (supabase) {
        const customerEmail =
          body.data?.attributes?.user_email ??
          body.data?.attributes?.customer_email

        if (customerEmail) {
          await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('email', customerEmail)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
