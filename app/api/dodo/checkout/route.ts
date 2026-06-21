export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'

export async function POST() {
  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const productId = process.env.DODO_PAYMENTS_PRODUCT_ID

    if (!apiKey || !productId) {
      return NextResponse.json(
        { error: 'Dodo Payments not configured' },
        { status: 500 },
      )
    }

    const client = new DodoPayments({ bearerToken: apiKey })

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
    })

    return NextResponse.json({ url: session.checkout_url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
