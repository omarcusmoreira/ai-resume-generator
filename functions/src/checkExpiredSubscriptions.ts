import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { PlanChangeTypeEnum, PlanQuotas, PlanTypeEnum } from '../../types/planHistory';

export const checkExpiredSubscriptions = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const now = admin.firestore.Timestamp.now();

  const expiredSubscriptions = await admin.firestore()
    .collection('planHistory')
    .where('expirationDate', '<=', now)
    .where('plan', 'in', [PlanTypeEnum.BASIC, PlanTypeEnum.PREMIUM])
    .get();

  const batch = admin.firestore().batch();

  for (const doc of expiredSubscriptions.docs) {
    const userId = doc.data().userId;
    await assignFreePlan(userId, batch);
  }

  await batch.commit();
});

async function assignFreePlan(userId: string, batch: admin.firestore.WriteBatch) {
  const userRef = admin.firestore().collection('users').doc(userId);

  const newPlanHistory = {
    plan: PlanTypeEnum.FREE,
    changeType: PlanChangeTypeEnum.DOWNGRADE,
    amountPaid: 0,
    planChangeDate: admin.firestore.Timestamp.now(),
    expirationDate: null,
    quotas: PlanQuotas[PlanTypeEnum.FREE],
    userId: userId,
  };

  const newPlanHistoryRef = admin.firestore().collection('planHistory').doc();
  batch.set(newPlanHistoryRef, newPlanHistory);

  batch.update(userRef, {
    currentPlanId: newPlanHistoryRef.id,
    isPremium: false,
  });
}