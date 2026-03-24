import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, planType } = session.metadata!

    const endDate = new Date()
    if (planType === 'monthly') endDate.setDate(endDate.getDate() + 30)
    else endDate.setDate(endDate.getDate() + 365)

    await supabase.from('subscriptions').insert({
      user_id: userId,
      plan_type: planType,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: endDate.toISOString()
    })
  }

  return NextResponse.json({ received: true })
}