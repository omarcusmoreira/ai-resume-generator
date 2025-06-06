import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/firebaseConfig';
import { collection, addDoc, doc, query, orderBy, limit, getDocs, runTransaction } from 'firebase/firestore';
import { createPlanHistoryObject, PlanChangeTypeEnum, PlanHistory, PlanHistoryData, PlanTypeEnum } from '@/types/planHistory';
import { v4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
]);

const planRanking = {
  [PlanTypeEnum.FREE]: 0,
  [PlanTypeEnum.BASIC]: 1,
  [PlanTypeEnum.PREMIUM]: 2,
};


function comparePlans(plan1: PlanTypeEnum, plan2: PlanTypeEnum): number {
  return planRanking[plan1] - planRanking[plan2];
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    //eslint-disable-next-line
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Received event type: ${event.type}`);

  if (relevantEvents.has(event.type)) {
    try {
      const eventId = event.id;
      const processedEventsRef = collection(db, 'processedEvents');
      const eventDoc = doc(processedEventsRef, eventId);

      const eventExists = await runTransaction(db, async (transaction) => {
        const eventSnapshot = await transaction.get(eventDoc);
        if (eventSnapshot.exists()) {
          return true;
        }
        transaction.set(eventDoc, { processedAt: new Date() });
        return false;
      });

      if (eventExists) {
        console.log(`Event ${eventId} has already been processed. Skipping.`);
        return NextResponse.json({ received: true, status: 'skipped' });
      }
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          throw new Error(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing event ${event.type}:`, error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return NextResponse.json(
        { error: `Error processing event ${event.type}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription') {
    const subscriptionId = session.subscription as string;
    if (!session.metadata || !session.metadata.userId) {
      throw new Error('handleCheckoutSessionCompleted: Session metadata or userId is missing.');
    }    
    const userId = session.metadata!.userId as string;
    let subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await stripe.subscriptions.update(subscriptionId, {
      metadata: { userId: userId }, 
    });
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log('Sbscription from handleCheckoutSessionCompleted without metadata: ',subscription);
    await saveSubscription(userId, subscriptionId, subscription, PlanChangeTypeEnum.NEW);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const changeType = await determineChangeType(subscription);
  await saveSubscription(subscription.metadata.userId as string, subscription.id, subscription, changeType);

  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    if (!subscription.metadata || !subscription.metadata.userId) {
      throw new Error('handleSubscriptionUpdate: Subscription metadata or userId is missing.');
    }    
    await downgradeToFreePlan(subscription.metadata.userId as string);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      await downgradeToFreePlan(subscription.metadata.userId as string);
    }
  }
}


async function determineChangeType(subscription: Stripe.Subscription): Promise<PlanChangeTypeEnum> {
  if (!subscription.metadata || !subscription.metadata.userId) {
    throw new Error('determineChangeType: Subscription metadata or userId is missing.');
  }
  const userId = subscription.metadata.userId;

  const userDocRef = doc(db, 'users', userId);
  const planHistoryRef = collection(userDocRef, 'planHistory');
  const q = query(planHistoryRef, orderBy('planChangeDate', 'desc'), limit(1));
  
  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return PlanChangeTypeEnum.NEW;
    }

    const lastPlanHistory = querySnapshot.docs[0].data() as PlanHistory;
    
    if (!subscription.items.data.length) {
      throw new Error('determineChangeType: No items found in subscription.');
    }
    const currentPlan = mapStripePlanToPlanType(subscription.items.data[0].price.id);

    if (currentPlan === lastPlanHistory.plan) {
      return PlanChangeTypeEnum.RENEWAL;
    }

    const comparison = comparePlans(currentPlan, lastPlanHistory.plan);
    if (comparison > 0) {
      return PlanChangeTypeEnum.UPGRADE;
    } else if (comparison < 0) {
      return PlanChangeTypeEnum.DOWNGRADE;
    } else {
      console.warn('Unexpected plan comparison result', { currentPlan, lastPlan: lastPlanHistory.plan });
      return PlanChangeTypeEnum.RENEWAL;
    }
  } catch (error) {
    console.error('Error in determineChangeType:', error);
    return PlanChangeTypeEnum.NEW;
  }
}

function mapStripePlanToPlanType(stripePriceId: string): PlanTypeEnum {
  console.log(`Mapping Stripe Price ID: ${stripePriceId}`);
  console.log(`NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID: ${process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID}`);
  console.log(`NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID: ${process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID}`);
  
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) {
    console.log('Mapped to BASIC plan');
    return PlanTypeEnum.BASIC;
  } else if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
    console.log('Mapped to PREMIUM plan');
    return PlanTypeEnum.PREMIUM;
  } else {
    console.log('Mapped to FREE plan (default case)');
    return PlanTypeEnum.FREE;
  }
}


async function saveSubscription(
  userId: string,
  subscriptionId: string,
  subscription: Stripe.Subscription,
  changeType: PlanChangeTypeEnum
) {
  console.log('Saving subscription:', JSON.stringify(subscription, null, 2));

  if (!subscription.items.data.length) {
    throw new Error('No items found in subscription');
  }

  const stripePriceId = subscription.items.data[0].price.id;
  console.log(`Stripe Price ID: ${stripePriceId}`);

  const planType = mapStripePlanToPlanType(stripePriceId);
  console.log(`Mapped Plan Type: ${planType}`);

  const amountPaid = subscription.items.data[0].price.unit_amount! / 100;

  const planHistoryData: PlanHistoryData = {
    id: subscriptionId,
    plan: planType,
    changeType: changeType,
    amountPaid: amountPaid,
  };

  console.log('Plan History Data:', JSON.stringify(planHistoryData, null, 2));

  const newPlanHistory = createPlanHistoryObject(planHistoryData);

  const userDocRef = doc(db, 'users', userId);
  const planHistoryRef = collection(userDocRef, 'planHistory');

  await runTransaction(db, async (transaction) => {
    const existingDoc = await transaction.get(doc(planHistoryRef, subscriptionId));
    if (!existingDoc.exists()) {
      transaction.set(doc(planHistoryRef, subscriptionId), newPlanHistory);
      console.log('New plan history saved successfully');
    } else {
      console.log('Plan history already exists, skipping save');
    }
  });
}

async function downgradeToFreePlan(userId: string) {

  const planHistoryData = {
    id: v4(),
    plan: PlanTypeEnum.FREE,
    changeType: PlanChangeTypeEnum.DOWNGRADE,
    amountPaid: 0,
  };

  const newPlanHistory = new PlanHistory(planHistoryData);

  const userDocRef = doc(db, 'users', userId);
  const planHistoryRef = collection(userDocRef, 'planHistory');
  await addDoc(planHistoryRef, newPlanHistory);
}