import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`);

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    
    // Create a Stripe customer
    const customer = await stripe.customers.create({
      name,
      email,
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
