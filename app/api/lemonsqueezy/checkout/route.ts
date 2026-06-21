export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST() {
  const checkoutUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: 'LemonSqueezy not configured' },
      { status: 500 },
    )
  }

  return NextResponse.json({ url: checkoutUrl })
}
