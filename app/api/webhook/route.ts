import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PlanHistory, PlanTypeEnum, PlanChangeTypeEnum, PlanHistoryData } from '@/types/planHistory';
import { addPlanHistory } from '@/services/planHistoryService';

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`);

const webhookSecret = `${process.env.STRIPE_WEBHOOK_SECRET!}`;

const stripePlanToPlanType: { [key: string]: PlanTypeEnum } = {
  'price_basic': PlanTypeEnum.BASIC,
  'price_premium': PlanTypeEnum.PREMIUM,
};

async function handleSubscriptionChange(subscription: Stripe.Subscription, changeType: PlanChangeTypeEnum) {
  const planId = subscription.items.data[0].price.id;
  const planType = stripePlanToPlanType[planId] || PlanTypeEnum.FREE;
  const amountPaid = subscription.items.data[0].price.unit_amount! / 100;

  const planHistoryData: PlanHistoryData = {
    id: subscription.id,
    plan: planType,
    changeType: changeType,
    amountPaid: amountPaid
  };

  const newPlanHistory = new PlanHistory(planHistoryData);

  await addPlanHistory(subscription.id, newPlanHistory);
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const planHistoryData: PlanHistoryData = {
    id: subscription.id,
    plan: PlanTypeEnum.FREE,
    changeType: PlanChangeTypeEnum.DOWNGRADE,
    amountPaid: 0
  };

  const newPlanHistory = new PlanHistory(planHistoryData);

  await addPlanHistory(subscription.id, newPlanHistory);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    //eslint-disable-next-line
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, PlanChangeTypeEnum.NEW);
        break;
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription>;
        
        if (previousAttributes.items) {
          // This is a plan change
          const oldPlanId = previousAttributes.items?.data[0].price.id;
          const newPlanId = updatedSubscription.items.data[0].price.id;
          const oldPlanType = stripePlanToPlanType[oldPlanId!] || PlanTypeEnum.FREE;
          const newPlanType = stripePlanToPlanType[newPlanId] || PlanTypeEnum.FREE;
          
          const changeType = newPlanType > oldPlanType ? PlanChangeTypeEnum.UPGRADE : PlanChangeTypeEnum.DOWNGRADE;
          await handleSubscriptionChange(updatedSubscription, changeType);
        } else {
          // This is a renewal
          await handleSubscriptionChange(updatedSubscription, PlanChangeTypeEnum.RENEWAL);
        }
        break;
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