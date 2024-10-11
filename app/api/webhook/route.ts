import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PlanHistory, PlanTypeEnum, PlanChangeTypeEnum, PlanHistoryData } from '@/types/planHistory';
import { addPlanHistory } from '@/services/planHistoryService';
import { getUserById } from '@/services/userServices';

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripePlanToPlanType: { [key: string]: PlanTypeEnum } = {
  'price_basic': PlanTypeEnum.BASIC,
  'price_premium': PlanTypeEnum.PREMIUM,
  // Add other plan mappings as needed
};

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  changeType: PlanChangeTypeEnum,
  session: Stripe.Checkout.Session
) {
  console.log('Initiating SubscriptionChange');
  console.log('Subscription object:', JSON.stringify(subscription, null, 2));
  console.log('Session object:', JSON.stringify(session, null, 2));

  const planId = subscription.items.data[0].price.id;
  const planType = stripePlanToPlanType[planId] || PlanTypeEnum.FREE;
  const amountPaid = subscription.items.data[0].price.unit_amount! / 100;

  const planHistoryData: PlanHistoryData = {
    id: subscription.id,
    plan: planType,
    changeType: changeType,
    amountPaid: amountPaid,
  };

  const newPlanHistory = new PlanHistory(planHistoryData);
  console.log('Created new planHistory', newPlanHistory);

  // Try to get the user using client_reference_id first
  let user = await getUserById(session.client_reference_id!);
  
  // If user not found, try using metadata.userId
  if (!user && session.metadata && session.metadata.userId) {
    user = await getUserById(session.metadata.userId);
  }
  
  // // If still not found, fall back to using Stripe customer ID
  // if (!user) {
  //   user = await getUserByStripeCustomerId(subscription.customer as string);
  // }

  console.log('User found:', user);

  if (!user) {
    console.error(`User not found for client_reference_id: ${session.client_reference_id}, metadata.userId: ${session.metadata?.userId}, or Stripe customer ID: ${subscription.customer}`);
    // Consider how you want to handle this case (e.g., create a new user, skip processing, etc.)
    return;
  }

  try {
    await addPlanHistory(user.userId, subscription.id, newPlanHistory);
    console.log('Successfully added plan history');
  } catch (error) {
    console.error('Failed to addPlanHistory', error);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    //eslint-disable-next-line
  } catch (err: any) {
    console.error('Error verifying webhook signature:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log('Received webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await handleSubscriptionChange(subscription, PlanChangeTypeEnum.NEW, session);
        break;
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        const updatedSession = await stripe.checkout.sessions.retrieve(updatedSubscription.metadata.checkout_session_id);
        await handleSubscriptionChange(updatedSubscription, PlanChangeTypeEnum.UPGRADE, updatedSession);
        break;
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedSession = await stripe.checkout.sessions.retrieve(deletedSubscription.metadata.checkout_session_id);
        await handleSubscriptionChange(deletedSubscription, PlanChangeTypeEnum.DOWNGRADE, deletedSession);
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

// export async function POST(req: Request) {
//   const body = await req.text();
//   const sig = req.headers.get('stripe-signature')!;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
//     //eslint-disable-next-line
//   } catch (err: any) {
//     console.error('Error verifying webhook signature:', err.message);
//     return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
//   }

//   try {
//     switch (event.type) {
//       case 'customer.subscription.created':
//         await handleSubscriptionChange(
//           event.data.object as Stripe.Subscription,
//           PlanChangeTypeEnum.NEW
//         );
//         break;

//       case 'customer.subscription.updated': {
//         const subscription = event.data.object as Stripe.Subscription;
//         const previousPlanId = subscription.items.data[0].price.id; // Get the old plan ID from the previous subscription
//         const newPlanId = subscription.items.data[0].price.id; // Get the new plan ID

//         const previousPlanType = stripePlanToPlanType[previousPlanId] || PlanTypeEnum.FREE;
//         const newPlanType = stripePlanToPlanType[newPlanId] || PlanTypeEnum.FREE;

//         const changeType = getPlanChangeType(previousPlanType, newPlanType);

//         await handleSubscriptionChange(subscription, changeType);
//         break;
//       }

//       case 'customer.subscription.deleted':
//         await handleSubscriptionDeletion(event.data.object as Stripe.Subscription);
//         break;

//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     return NextResponse.json({ received: true });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
