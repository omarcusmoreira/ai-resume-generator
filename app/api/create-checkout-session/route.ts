import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`);

export async function POST(request: Request) {
  try {
    const { priceId, userId, email } = await request.json();

    if (!priceId || !userId || !email) {
      return NextResponse.json({ error: 'Missing priceId, userId, or email' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`,
      client_reference_id: userId,
      customer_email: email,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
    //eslint-disable-next-line
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message || 'Error creating checkout session' }, { status: 500 });
  }
}