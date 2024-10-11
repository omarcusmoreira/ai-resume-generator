import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { PlanTypeEnum, PlanChangeTypeEnum, PlanQuotas } from '../../types/planHistory';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const updateUserPlanInFirebase = async (
  customerId: string,
  planId: string | PlanTypeEnum,
  subscription: Stripe.Subscription
) => {
  const userSnapshot = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .get();

  if (userSnapshot.empty) {
    console.error(`No user found for Stripe customer ID: ${customerId}`);
    throw new Error('User not found');
  }

  const user = userSnapshot.docs[0];
  const userId = user.id;

  const planType = typeof planId === 'string' ? getPlanTypeFromStripeplan(planId) : planId;
  const changeType: PlanChangeTypeEnum = subscription.status === 'active' ? 
    PlanChangeTypeEnum.UPGRADE : PlanChangeTypeEnum.NEW;

  const newPlanHistory = {
    plan: planType,
    changeType: changeType,
    amountPaid: subscription.items.data[0].price.unit_amount! / 100,
    planChangeDate: admin.firestore.Timestamp.now(),
    expirationDate: admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_end * 1000)
    ),
    quotas: PlanQuotas[planType],
  };

  console.log(`Updating plan for user: ${userId} to plan: ${planType}`);

  const planHistoryRef = await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('planHistory')
    .add(newPlanHistory);

  await user.ref.update({
    currentPlanId: planHistoryRef.id,
    isPremium: planType !== PlanTypeEnum.FREE,
  });

  console.log(`Successfully updated plan for user: ${userId}`);
};

function getPlanTypeFromStripeplan(stripePlanId: string): PlanTypeEnum {
  console.log(`Mapping Stripe plan ID: ${stripePlanId}`);
  const planMapping: { [key: string]: PlanTypeEnum } = {
    'price_1234567890': PlanTypeEnum.BASIC,    // Replace with your actual Stripe price ID for BASIC plan
    'price_0987654321': PlanTypeEnum.PREMIUM,  // Replace with your actual Stripe price ID for PREMIUM plan
  };
  const planType = planMapping[stripePlanId] || PlanTypeEnum.FREE;
  console.log(`Mapped to plan type: ${planType}`);
  return planType;
}