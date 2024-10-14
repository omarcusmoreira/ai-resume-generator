import { db } from "@/firebaseConfig";
import { 
    collection, deleteDoc, doc, getDocs, setDoc, updateDoc, query, orderBy, limit, 
    Timestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { PlanChangeTypeEnum, PlanHistory, PlanTypeEnum } from "@/types/planHistory";
import { v4 } from "uuid";

const getUserId = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated - planHistoryService');
    }
    return currentUser.uid;
};

const SESSION_KEY = 'planHistory';

// Function to get plan history from session storage
const getSessionData = () => {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
};

// Function to set plan history in session storage
const setSessionData = (data: PlanHistory[]) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

// Add plan history
export const addPlanHistory = async (userId: string, planHistoryId: string, planHistory: PlanHistory): Promise<void> => {
    const planHistoryCollection = collection(db, 'users', userId, 'planHistory');
    const docRef = doc(planHistoryCollection, planHistoryId);
    
    const newPlanHistory: PlanHistory = {
      id: planHistoryId,
      plan: planHistory.plan,
      quotas: planHistory.quotas,
      amountPaid: planHistory.amountPaid,
      changeType: planHistory.changeType,
      planChangeDate: planHistory.planChangeDate,
      expirationDate: planHistory.expirationDate,
    };

    await setDoc(docRef, newPlanHistory);
    
    // Update session storage
    const cachedPlanHistory = getSessionData() || [];
    setSessionData([...cachedPlanHistory, newPlanHistory]);
};
// Get all plan history
export const getPlanHistory = async (): Promise<PlanHistory[]> => {
    const cachedPlanHistory = getSessionData();
    if (cachedPlanHistory) {
        return cachedPlanHistory; // Return cached data if available
    }

    const userId = getUserId();
    const planHistoryCollection = collection(db, 'users', userId, 'planHistory');
    const planHistorySnap = await getDocs(planHistoryCollection);
    const planHistory = planHistorySnap.docs.map((doc) => doc.data() as PlanHistory);
    
    // Cache fetched data
    setSessionData(planHistory);
    return planHistory;
};

export const getCurrentPlan = async (): Promise<{ currentPlan: PlanTypeEnum, planHistory: PlanHistory[] }> => {
    const userId = getUserId()
    const planHistoryQuery = query(
        collection(db, 'users', userId, 'planHistory'),
        orderBy('planChangeDate', 'desc'),
        limit(1)
    );

    const querySnapshot = await getDocs(planHistoryQuery);
    let currentPlan = PlanTypeEnum.FREE;
    let planHistory: PlanHistory[] = [];

    if (!querySnapshot.empty) {
        const planData = querySnapshot.docs[0].data() as PlanHistory;
        currentPlan = planData.plan;
        planHistory = [planData];

        const now = Timestamp.now();
        if (now.toMillis() > planData.expirationDate.toMillis()) {
            console.log('Plan expired. Renewing planHistory...');
            const newPlanHistory = new PlanHistory({
                id: v4(),
                plan: PlanTypeEnum.FREE,
                changeType: PlanChangeTypeEnum.FREE_RENEWAL,
                amountPaid: 0,
            });

            await addPlanHistory(userId, newPlanHistory.id, newPlanHistory);
            currentPlan = PlanTypeEnum.FREE;
            planHistory = [newPlanHistory, ...planHistory];
        }
    } else {
        // If no plan history exists, create a new FREE plan
        const newPlanHistory = new PlanHistory({
            id: v4(),
            plan: PlanTypeEnum.FREE,
            changeType: PlanChangeTypeEnum.FREE_RENEWAL,
            amountPaid: 0,
        });

        await addPlanHistory(userId, newPlanHistory.id, newPlanHistory);
        currentPlan = PlanTypeEnum.FREE;
        planHistory = [newPlanHistory];
    }

    return { currentPlan, planHistory };
}

// Update plan history
export const updatePlanHistory = async (planHistoryId: string, planHistory: Partial<PlanHistory>): Promise<void> => {
    const userId = getUserId();
    const planHistoryRef = doc(db, 'users', userId, 'planHistory', planHistoryId);
    await updateDoc(planHistoryRef, planHistory);
    
    // Update session storage
    const cachedPlanHistory = getSessionData();
    if (cachedPlanHistory) {
        const updatedPlanHistory = cachedPlanHistory.map((p: PlanHistory) =>
            p.id === planHistoryId ? { ...p, ...planHistory } : p
        );
        setSessionData(updatedPlanHistory);
    }
};

// Delete plan history
export const deletePlanHistory = async (planHistoryId: string): Promise<void> => {
    const userId = getUserId();
    const planHistoryRef = doc(db, 'users', userId, 'planHistory', planHistoryId);
    await deleteDoc(planHistoryRef);
    
    // Remove from session storage
    const cachedPlanHistory = getSessionData();
    if (cachedPlanHistory) {
        const updatedPlanHistory = cachedPlanHistory.filter((p: PlanHistory) => p.id !== planHistoryId);
        setSessionData(updatedPlanHistory);
    }
};
