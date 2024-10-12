import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/firebaseConfig';
import { collection, addDoc, doc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { PlanChangeTypeEnum, PlanHistory, PlanTypeEnum } from '@/types/planHistory';
import { getUserByStripeCustomerId } from '@/services/userServices';
import { v4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
]);

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
    const customerId = session.customer as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await saveSubscription(customerId, subscriptionId, subscription, PlanChangeTypeEnum.NEW);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const changeType = await determineChangeType(subscription);
  await saveSubscription(subscription.customer as string, subscription.id, subscription, changeType);

  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    await downgradeToFreePlan(subscription.customer as string);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      await downgradeToFreePlan(subscription.customer as string);
    }
  }
}

async function determineChangeType(subscription: Stripe.Subscription): Promise<PlanChangeTypeEnum> {
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    return PlanChangeTypeEnum.DOWNGRADE;
  }

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const user = await getUserByStripeCustomerId(customer.id);
  if (!user) {
    throw new Error(`User not found for Stripe customer ID: ${customer.id}`);
  }

  const userDocRef = doc(db, 'users', user.id);
  const planHistoryRef = collection(userDocRef, 'planHistory');
  const q = query(planHistoryRef, orderBy('planChangeDate', 'desc'), limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return PlanChangeTypeEnum.NEW;
  }

  const lastPlanHistory = querySnapshot.docs[0].data() as PlanHistory;
  const currentPlan = mapStripePlanToPlanType(subscription.items.data[0].price.id);

  if (currentPlan === lastPlanHistory.plan) {
    return PlanChangeTypeEnum.RENEWAL;
  }

  return currentPlan > lastPlanHistory.plan ? PlanChangeTypeEnum.UPGRADE : PlanChangeTypeEnum.DOWNGRADE;
}

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
  customerId: string,
  subscriptionId: string,
  subscription: Stripe.Subscription,
  changeType: PlanChangeTypeEnum
) {
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    throw new Error(`User not found for Stripe customer ID: ${customerId}`);
  }

  const stripePlanId = subscription.items.data[0].price.id;
  const planType = mapStripePlanToPlanType(stripePlanId);
  const amountPaid = subscription.items.data[0].price.unit_amount! / 100; // Convert cents to dollars

  const planHistoryData = {
    id: subscriptionId,
    plan: planType,
    changeType: changeType,
    amountPaid: amountPaid,
  };

  const newPlanHistory = new PlanHistory(planHistoryData);

  const userDocRef = doc(db, 'users', user.id);
  const planHistoryRef = collection(userDocRef, 'planHistory');
  await addDoc(planHistoryRef, newPlanHistory);
}

async function downgradeToFreePlan(customerId: string) {
  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    throw new Error(`User not found for Stripe customer ID: ${customerId}`);
  }

  const planHistoryData = {
    id: v4(),
    plan: PlanTypeEnum.FREE,
    changeType: PlanChangeTypeEnum.DOWNGRADE,
    amountPaid: 0,
  };

  const newPlanHistory = new PlanHistory(planHistoryData);

  const userDocRef = doc(db, 'users', user.id);
  const planHistoryRef = collection(userDocRef, 'planHistory');
  await addDoc(planHistoryRef, newPlanHistory);
}