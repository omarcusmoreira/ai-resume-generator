import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`);

export async function POST(request: Request) {
  try {
    const { name, email, uid } = await request.json();
    
    // Create a Stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
      metadata: {
        userId: uid, // store your app's user ID here
      },
    });


    return NextResponse.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
