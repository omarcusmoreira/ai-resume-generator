import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const planType = session.metadata?.planType;

    return NextResponse.json({
      subscriptionId: session.subscription as string,
      planType,
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 });
  }
}

