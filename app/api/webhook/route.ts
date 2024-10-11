import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PlanHistory, PlanTypeEnum, PlanChangeTypeEnum, PlanHistoryData } from '@/types/planHistory';
import { addPlanHistory } from '@/services/planHistoryService';
import { getUserByStripeCustomerId } from '@/services/userServices';

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripePlanToPlanType: { [key: string]: PlanTypeEnum } = {
  'price_basic': PlanTypeEnum.BASIC,
  'price_premium': PlanTypeEnum.PREMIUM,
  // Add other plan mappings as needed
};

function getPlanChangeType(oldPlanType: PlanTypeEnum, newPlanType: PlanTypeEnum): PlanChangeTypeEnum {
  if (oldPlanType === newPlanType) {
    return PlanChangeTypeEnum.RENEWAL;
  }
  return newPlanType > oldPlanType ? PlanChangeTypeEnum.UPGRADE : PlanChangeTypeEnum.DOWNGRADE;
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  changeType: PlanChangeTypeEnum
) {
  console.log('Initiating SubscriptionChange');
  const planId = subscription.items.data[0].price.id;
  const planType = stripePlanToPlanType[planId] || PlanTypeEnum.FREE;
  const amountPaid = subscription.items.data[0].price.unit_amount! / 100; // Convert cents to dollars

  const planHistoryData: PlanHistoryData = {
    id: subscription.id,
    plan: planType,
    changeType: changeType,
    amountPaid: amountPaid,
  };

  const newPlanHistory = new PlanHistory(planHistoryData);
  console.log('Created new planHistory', newPlanHistory);

  // Get the user ID based on the Stripe customer ID
  const user = await getUserByStripeCustomerId(subscription.customer as string);
  if (!user) {
    throw new Error(`User not found for Stripe customer ID: ${subscription.customer}`);
  }

  try {
    await addPlanHistory(user.id, subscription.id, newPlanHistory);
  } catch (error) {
    console.log('Failed to addPlanHistory', error);
  }
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const planHistoryData: PlanHistoryData = {
    id: subscription.id,
    plan: PlanTypeEnum.FREE,
    changeType: PlanChangeTypeEnum.DOWNGRADE,
    amountPaid: 0,
  };

  const newPlanHistory = new PlanHistory(planHistoryData);

  // Get the user ID based on the Stripe customer ID
  const user = await getUserByStripeCustomerId(subscription.customer as string);
  if (!user) {
    throw new Error(`User not found for Stripe customer ID: ${subscription.customer}`);
  }

  await addPlanHistory(user.id, subscription.id, newPlanHistory);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Error verifying webhook signature:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
          PlanChangeTypeEnum.NEW
        );
        break;

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const previousPlanId = subscription.items.data[0].price.id; // Get the old plan ID from the previous subscription
        const newPlanId = subscription.items.data[0].price.id; // Get the new plan ID

        const previousPlanType = stripePlanToPlanType[previousPlanId] || PlanTypeEnum.FREE;
        const newPlanType = stripePlanToPlanType[newPlanId] || PlanTypeEnum.FREE;

        const changeType = getPlanChangeType(previousPlanType, newPlanType);

        await handleSubscriptionChange(subscription, changeType);
        break;
      }

      case 'customer.subscription.deleted':
        await handleSubscriptionDeletion(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
