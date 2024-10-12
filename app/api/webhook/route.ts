import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/firebaseConfig';
import { collection, addDoc, doc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { PlanChangeTypeEnum, PlanHistory, PlanHistoryData, PlanQuotas, PlanTypeEnum } from '@/types/planHistory';
import { v4 } from 'uuid';
import { Timestamp } from '@google-cloud/firestore';

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

export function createPlanHistoryObject(data: PlanHistoryData): Record<string, any> {
  const planChangeDate = Timestamp.now();
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 30);
  const expirationDate = Timestamp.fromDate(expiration);

  return {
    id: data.id,
    plan: data.plan,
    changeType: data.changeType,
    amountPaid: data.amountPaid,
    planChangeDate: planChangeDate,
    expirationDate: expirationDate,
    quotas: PlanQuotas[data.plan],
  };
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

  if (relevantEvents.has(event.type)) {
    try {
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

// Make sure this function correctly maps Stripe price IDs to PlanTypeEnum
function mapStripePlanToPlanType(stripePlanId: string): PlanTypeEnum {
  switch (stripePlanId) {
    case process.env.STRIPE_BASIC_PRICE_ID:
      return PlanTypeEnum.BASIC;
    case process.env.STRIPE_PREMIUM_PRICE_ID:
      return PlanTypeEnum.PREMIUM;
    default:
      return PlanTypeEnum.FREE;
  }
}

async function saveSubscription(
  userId: string,
  subscriptionId: string,
  subscription: Stripe.Subscription,
  changeType: PlanChangeTypeEnum
) {
  const stripePlanId = subscription.items.data[0].price.id;
  const planType = mapStripePlanToPlanType(stripePlanId);
  const amountPaid = subscription.items.data[0].price.unit_amount! / 100;

  const planHistoryData: PlanHistoryData = {
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