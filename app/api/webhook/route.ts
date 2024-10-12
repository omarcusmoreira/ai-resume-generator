import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/firebaseConfig';
import { doc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { PlanTypeEnum, PlanChangeTypeEnum, PlanHistory, createPlanHistoryObject } from '@/types/planHistory';
import { v4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription') {
    const subscriptionId = session.subscription as string;
    if (!session.metadata || !session.metadata.userId) {
      throw new Error('handleCheckoutSessionCompleted: Session metadata or userId is missing.');
    }    
    const userId = session.metadata.userId;
    let subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Only update metadata if it's not already set
    if (!subscription.metadata.userId) {
      await stripe.subscriptions.update(subscriptionId, {
        metadata: { userId: userId },
      });
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }
    
    console.log('Subscription from handleCheckoutSessionCompleted:', subscription);
    await saveSubscription(userId, subscriptionId, subscription, PlanChangeTypeEnum.NEW);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  if (!subscription.metadata || !subscription.metadata.userId) {
    throw new Error('handleSubscriptionUpdate: Subscription metadata or userId is missing.');
  }
  const userId = subscription.metadata.userId;
  const changeType = await determineChangeType(subscription);
  await saveSubscription(userId, subscription.id, subscription, changeType);

  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    await downgradeToFreePlan(userId);
  }
}

function mapStripePlanToPlanType(stripePlanId: string): PlanTypeEnum {
  console.log('Mapping Stripe Plan ID:', stripePlanId);
  switch (stripePlanId) {
    case process.env.STRIPE_BASIC_PRICE_ID:
      return PlanTypeEnum.BASIC;
    case process.env.STRIPE_PREMIUM_PRICE_ID:
      return PlanTypeEnum.PREMIUM;
    default:
      console.warn('Unknown Stripe Plan ID, defaulting to FREE:', stripePlanId);
      return PlanTypeEnum.FREE;
  }
}

async function saveSubscription(
  userId: string,
  subscriptionId: string,
  subscription: Stripe.Subscription,
  changeType: PlanChangeTypeEnum
) {
  if (!subscription.items.data.length) {
    throw new Error('saveSubscription: No items found in subscription.');
  }
  const stripePlanId = subscription.items.data[0].price.id;
  const planType = mapStripePlanToPlanType(stripePlanId);
  const amountPaid = subscription.items.data[0].price.unit_amount! / 100;

  console.log('Saving subscription:', { userId, subscriptionId, planType, changeType, amountPaid });

  const planHistoryData = {
    id: subscriptionId,
    plan: planType,
    changeType: changeType,
    amountPaid: amountPaid,
  };

  const newPlanHistory = createPlanHistoryObject(planHistoryData);

  const userDocRef = doc(db, 'users', userId);
  const planHistoryRef = collection(userDocRef, 'planHistory');
  await addDoc(planHistoryRef, newPlanHistory);
}

// Make sure to implement createPlanHistoryObject as discussed in previous messages

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      // ... other event types
    }
  } catch (error) {
    console.error(`Error processing event ${event.type}:`, error);
    return NextResponse.json(
      { error: `Error processing event ${event.type}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
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
      // This case should not occur if the plans are different and correctly mapped
      console.warn('Unexpected plan comparison result', { currentPlan, lastPlan: lastPlanHistory.plan });
      return PlanChangeTypeEnum.RENEWAL;
    }
  } catch (error) {
    console.error('Error in determineChangeType:', error);
    // Default to NEW if there's an error
    return PlanChangeTypeEnum.NEW;
  }
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