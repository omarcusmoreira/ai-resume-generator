import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from "@/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`);

export async function POST(request: Request) {
  try {
    const { priceId, userId, email } = await request.json();

    if (!priceId || !userId || !email) {
      return NextResponse.json({ error: 'Missing priceId, userId, or email' }, { status: 400 });
    }

    // Check if a customer already exists with this email
    const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });
    let customer;
    let isNewCustomer = false;

    if (existingCustomers.data.length > 0) {
      // Use existing customer
      customer = existingCustomers.data[0];
    } else {
      // Create a new customer if one doesn't exist
      customer = await stripe.customers.create({
        email: email,
        metadata: { userId: userId },
      });
      isNewCustomer = true;
    }

    // If it's a new customer, update the user data in Firestore
    if (isNewCustomer) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          stripeCustomerId: customer.id
        });
      } else {
        // If the user document doesn't exist, create it
        await setDoc(userRef, {
          userId: userId,
          personalInfo: { email: email },
          stripeCustomerId: customer.id
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`,
      client_reference_id: userId,
      customer: customer.id,
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