import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId, email } = await req.json()

  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: email,
            custom: { user_id: userId },
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: process.env.LEMONSQUEEZY_VARIANT_ID,
            },
          },
        },
      },
    }),
  })

  const data = await res.json()
  const url = data?.data?.attributes?.url

  if (!url) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }

  return NextResponse.json({ url })
}
