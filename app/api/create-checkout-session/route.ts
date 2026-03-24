import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { planType, userId } = await req.json()

    const priceIds = {
      monthly: 'price_monthly_xxxxx', // Replace with your Stripe price ID
      yearly: 'price_yearly_xxxxx'    // Replace with your Stripe price ID
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceIds[planType as keyof typeof priceIds], quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { userId, planType }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}