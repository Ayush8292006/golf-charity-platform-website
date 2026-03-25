import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { planType, userId } = await req.json()

    // Replace these with your actual Stripe Price IDs
    const priceIds = {
      monthly: 'price_1R0abc2Lz8S0jQk5Hj7fD6k9',  // Your monthly price ID
      yearly: 'price_1R0def3Lz8S0jQk5Hj7fD6k9'   // Your yearly price ID
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIds[planType as keyof typeof priceIds],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        planType
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}