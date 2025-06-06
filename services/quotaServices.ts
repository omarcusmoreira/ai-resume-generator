import { getFirestore, doc, collection, getDocs, orderBy, limit, query, runTransaction, getDoc } from "firebase/firestore";
import { QuotasType } from "@/types/planHistory";
import { getAuth, onAuthStateChanged } from "firebase/auth";


// Call Firestore directly to decrement quotas
export const decrementQuota = async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters'): Promise<void> => {
    try {
        // Get Firebase Firestore and Auth instances
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User must be authenticated');
        }

        const userId = user.uid;

        // Get the latest plan history document for the user
        const planHistoryRef = collection(db, 'users', userId, 'planHistory');
        const planHistoryQuery = query(planHistoryRef, orderBy('planChangeDate', 'desc'), limit(1));

        const planHistorySnap = await getDocs(planHistoryQuery);

        if (planHistorySnap.empty) {
            throw new Error('Plan history not found');
        }

        const latestPlanDoc = planHistorySnap.docs[0];
        const latestPlanDocRef = doc(db, 'users', userId, 'planHistory', latestPlanDoc.id);
        console.log(latestPlanDocRef)

        // Run a transaction to ensure atomicity
        await runTransaction(db, async (transaction) => {
            const planDoc = await transaction.get(latestPlanDocRef);
            const planData = planDoc.data();

            if (!planData || !planData.quotas.hasOwnProperty(quotaType)) {
                throw new Error('Invalid quota type');
            }

            const currentQuota = planData.quotas[quotaType];

            if (currentQuota <= 0) {
                throw new Error(`No ${quotaType} quotas left`);
            }

            const updatedQuota = currentQuota - 1;

            // Update the quota in the document
            transaction.update(latestPlanDocRef, {
                [`quotas.${quotaType}`]: updatedQuota,
            });

            console.log(`Quota for ${quotaType} decremented successfully. New quota: ${updatedQuota}`);
        });

    } catch (error) {
        console.error('Error decrementing quota:', error);
        throw new Error('Failed to decrement quota');
    }
};

export const incrementQuota = async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters'): Promise<void> => {
    try {
        // Get Firebase Firestore and Auth instances
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User must be authenticated');
        }

        const userId = user.uid;

        // Get the latest plan history document for the user
        const planHistoryRef = collection(db, 'users', userId, 'planHistory');
        const planHistoryQuery = query(planHistoryRef, orderBy('planChangeDate', 'desc'), limit(1));

        const planHistorySnap = await getDocs(planHistoryQuery);

        if (planHistorySnap.empty) {
            throw new Error('Plan history not found');
        }

        const latestPlanDoc = planHistorySnap.docs[0];
        const latestPlanDocRef = doc(db, 'users', userId, 'planHistory', latestPlanDoc.id);

        // Run a transaction to ensure atomicity
        await runTransaction(db, async (transaction) => {
            const planDoc = await transaction.get(latestPlanDocRef);
            const planData = planDoc.data();

            if (!planData || !planData.quotas.hasOwnProperty(quotaType)) {
                throw new Error('Invalid quota type');
            }

            const currentQuota = planData.quotas[quotaType];

            const updatedQuota = currentQuota + 1;

            // Update the quota in the document
            transaction.update(latestPlanDocRef, {
                [`quotas.${quotaType}`]: updatedQuota,
            });

            console.log(`Quota for ${quotaType} incremented successfully. New quota: ${updatedQuota}`);
        });

    } catch (error) {
        console.error('Error decrementing quota:', error);
        throw new Error('Failed to increment quota');
    }
};
export const getQuotaByType = async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters'): Promise<number> => {
    const db = getFirestore();
    const auth = getAuth(); 
    const user = auth.currentUser;

    if (!user) {
        throw new Error('User must be authenticated');
    }

    const userId = user.uid;

    const planHistoryRef = collection(db, 'users', userId, 'planHistory');
    const planHistoryQuery = query(planHistoryRef, orderBy('planChangeDate', 'desc'), limit(1));

    const planHistorySnap = await getDocs(planHistoryQuery);
    
    if (planHistorySnap.empty) {
        throw new Error('Plan history not found');
    }

    const latestPlanDoc = planHistorySnap.docs[0];
    const latestPlanDocRef = doc(db, 'users', userId, 'planHistory', latestPlanDoc.id);

    const planDoc = await getDoc(latestPlanDocRef);
    
    if (!planDoc.exists()) {
        throw new Error('Plan document not found');
    }

    const planData = planDoc.data();

    if (!planData || !planData.quotas.hasOwnProperty(quotaType)) {
        throw new Error('Invalid quota type');
    }

    return planData.quotas[quotaType];
};

export const getQuotas = async (): Promise<QuotasType> => {
    const db = getFirestore();
    const auth = getAuth();

    return new Promise<QuotasType>((resolve, reject) => {
        // Subscribe to auth state changes
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                reject(new Error('User must be authenticated'));
                return;
            }

            const userId = user.uid;

            const planHistoryRef = collection(db, 'users', userId, 'planHistory');
            const planHistoryQuery = query(planHistoryRef, orderBy('planChangeDate', 'desc'), limit(1));

            try {
                const planHistorySnap = await getDocs(planHistoryQuery);
                const quotas: QuotasType = {
                    resumes: 2,
                    profiles: 1,
                    recruiters: 10,
                    interactions: 10,
                    opportunities: 10,
                }

                planHistorySnap.forEach((doc) => {
                    const planData = doc.data();
                    if (planData) {
                        quotas.profiles = planData.quotas.profiles;
                        quotas.resumes = planData.quotas.resumes;
                        quotas.opportunities = planData.quotas.opportunities;
                        quotas.interactions = planData.quotas.interactions;
                        quotas.recruiters = planData.quotas.recruiters;
                    }
                });

                resolve(quotas);
            } catch (error) {
                reject(error);
            }
        });
    });
};