import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const decrementQuota = functions.https.onCall(async (request) => {
    const { quotaType } = request.data;

    console.log("Request received with quotaType:", quotaType);

    // Check if the user is authenticated
    if (!request.auth) {
        console.log("Error: User is not authenticated");
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    console.log(`Authenticated user: ${userId}`);

    try {
        // Log before accessing Firestore
        console.log("Fetching user's plan history...");

        // Get the latest plan history document for the user
        const planHistoryRef = db.collection('users').doc(userId).collection('planHistory')
            .orderBy('planChangeDate', 'desc').limit(1);

        const planHistorySnap = await planHistoryRef.get();

        // Check if the snapshot is empty
        console.log(`Plan history fetched for user ${userId}. Is empty: ${planHistorySnap.empty}`);

        // Check if there is any plan history for the user
        if (planHistorySnap.empty) {
            console.log("Plan history not found for user:", userId);
            throw new functions.https.HttpsError('not-found', 'Plan history not found');
        }

        const latestPlanDoc = planHistorySnap.docs[0];
        console.log(`Latest plan document ID for user ${userId}: ${latestPlanDoc.id}`);

        // Use Firestore transaction to ensure atomic updates
        await db.runTransaction(async (transaction) => {
            console.log("Starting transaction...");

            const planDoc = await transaction.get(latestPlanDoc.ref);
            console.log("Plan document data fetched in transaction:", planDoc.exists);

            const planData = planDoc.data();
            if (!planData) {
                console.log("No plan data found for user", userId);
                throw new functions.https.HttpsError('not-found', 'Plan data is missing');
            }

            // Validate quota type
            if (!planData.quotas.hasOwnProperty(quotaType)) {
                console.log("Error: Invalid quota type", quotaType);
                throw new functions.https.HttpsError('invalid-argument', 'Invalid quota type');
            }

            // Check if user has sufficient quota
            if (planData.quotas[quotaType] <= 0) {
                console.log(`No quota left for type ${quotaType}`);
                throw new functions.https.HttpsError('failed-precondition', `No ${quotaType} quotas left`);
            }

            // Decrement the quota
            const updatedQuota = planData.quotas[quotaType] - 1;
            console.log(`Decrementing quota for ${quotaType}. New value: ${updatedQuota}`);

            // Update the document with the new quota
            transaction.update(latestPlanDoc.ref, {
                [`quotas.${quotaType}`]: updatedQuota
            });

            console.log("Quota decremented successfully inside transaction");
        });

        console.log(`Quota for ${quotaType} decremented successfully for user ${userId}`);
        return { success: true };

    } catch (error) {
        console.error('Error decrementing quota:', error);

        // Catch Firebase-specific errors
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        // Fallback for generic errors
        throw new functions.https.HttpsError('internal', 'An internal error occurred while decrementing quota');
    }
});
