import { db } from "@/firebaseConfig";
import { 
    collection, deleteDoc, doc, getDocs, limit, orderBy, query, setDoc, updateDoc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { PlanHistory } from "@/types/planHistory";

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
export const addPlanHistory = async (planHistoryId: string, planHistory: PlanHistory): Promise<void> => {
    const userId = getUserId();
    const planHistoryCollection = collection(db, 'users', userId, 'planHistory');
    const docRef = doc(planHistoryCollection, planHistoryId);
    
    const plainPlanHistory: PlanHistory   = {
      id: planHistoryId,
      plan: planHistory.plan,
      quotas: planHistory.quotas,
      amountPaid: planHistory.amountPaid,
      changeType: planHistory.changeType,
      planChangeDate: planHistory.planChangeDate,
      expirationDate: planHistory.expirationDate,
    };

    await setDoc(docRef, plainPlanHistory);
    
    // Update session storage
    const cachedPlanHistory = getSessionData() || [];
    setSessionData([...cachedPlanHistory, plainPlanHistory]);
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

// Get latest plan history
export const getCurrentPlanHistory = async (): Promise<PlanHistory | null> => {
    try {
        const userId = getUserId();
        const planHistoryCollection = collection(db, 'users', userId, 'planHistory');
        
        const planHistoryQuery = query(planHistoryCollection, orderBy('planChangeDate', 'desc'), limit(1));
        const planHistorySnap = await getDocs(planHistoryQuery);
        
        if (planHistorySnap.empty) {
            return null;
        }
        
        const latestPlanDoc = planHistorySnap.docs[0];
        return latestPlanDoc.data() as PlanHistory;
        
    } catch (error) {
        console.error("Error retrieving latest plan history:", error);
        return null;
    }
};

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
