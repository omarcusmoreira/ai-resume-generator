import { getFirestore, doc, collection, getDocs, orderBy, limit, query, runTransaction, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { QuotasType } from "@/types/planHistory";

// Call Firestore directly to decrement quotas
export const decrementQuota = async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'contacts'): Promise<void> => {
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

export const incrementQuota = async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'contacts'): Promise<void> => {
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
export const getQuotaByType = async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'contacts'): Promise<number> => {
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
    const user = auth.currentUser;

    if (!user) {
        throw new Error('User must be authenticated');
    }

    const userId = user.uid;

    const planHistoryRef = collection(db, 'users', userId, 'planHistory');
    const planHistoryQuery = query(planHistoryRef, orderBy('planChangeDate', 'desc'), limit(1));

    const planHistorySnap = await getDocs(planHistoryQuery);
    
    const quotas: QuotasType = {
        profiles: 0,
        resumes: 0,
        opportunities: 0,
        interactions: 0,
        contacts: 0,
    }

    planHistorySnap.forEach((doc) => {
        const planData = doc.data();
        if (planData) {
            quotas.profiles += planData.quotas.profiles;
            quotas.resumes += planData.quotas.resumes;
            quotas.opportunities += planData.quotas.opportunities;
            quotas.interactions += planData.quotas.interactions;
            quotas.contacts =+ planData.quotas.contacts;
        }
    })  

    return quotas;
}   