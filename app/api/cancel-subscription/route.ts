import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/firebaseConfig';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { createPlanHistoryObject, PlanChangeTypeEnum, PlanTypeEnum } from '@/types/planHistory';
import { v4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId, stripeCustomerId } = await req.json();

  console.log('stripeCustomerId from client', stripeCustomerId)

  if (!stripeCustomerId || stripeCustomerId === '') {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Cancel the subscription in Stripe
    const subscription = subscriptions.data[0];
    await stripe.subscriptions.cancel(subscription.id);

    // Add a new plan history entry for the cancellation
    const newPlanHistory = createPlanHistoryObject({
      id: v4(),
      plan: PlanTypeEnum.FREE,
      changeType: PlanChangeTypeEnum.DOWNGRADE,
      amountPaid: 0,
    });

    const planHistoryRef = collection(userDocRef, 'planHistory');
    await addDoc(planHistoryRef, newPlanHistory);

    return NextResponse.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: 'An error occurred while cancelling the subscription' }, { status: 500 });
  }
}