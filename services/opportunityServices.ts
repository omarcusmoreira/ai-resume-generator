import { OpportunityType } from "@/types/opportunities";
import { db } from "@/firebaseConfig";
import { 
    doc, setDoc, updateDoc, deleteDoc, 
    collection, getDocs 
} from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const getUserId = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated - opportunityServices');
    }
    return currentUser.uid;
};

const SESSION_KEY = 'userOpportunities';

// Get opportunities from session storage
const getSessionData = () => {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
};

// Set opportunities in session storage
const setSessionData = (data: OpportunityType[]) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

// Add an opportunity
export const addOpportunity = async (
  opportunityId: string, opportunity: OpportunityType
): Promise<void> => {
    const userId = getUserId();
    const opportunitiesCollection = collection(db, 'users', userId, 
                                               'opportunities');
    const docRef = doc(opportunitiesCollection, opportunityId);
    const updatedOpportunity = { ...opportunity, id: opportunityId };
    await setDoc(docRef, updatedOpportunity);
    
    // Update session storage
    const cachedOpportunities = getSessionData() || [];
    setSessionData([...cachedOpportunities, updatedOpportunity]);
};

// Get all opportunities
export const getOpportunities = async (): Promise<OpportunityType[]> => {
    const cachedOpportunities = getSessionData();
    if (cachedOpportunities) {
        return cachedOpportunities;
    }

    const userId = getUserId();
    const opportunitiesCollection = collection(db, 'users', userId, 'opportunities');
    const opportunitiesSnap = await getDocs(opportunitiesCollection);
    const opportunities = opportunitiesSnap.docs.map(doc => ({
        id: doc.id, ...doc.data()
    } as OpportunityType));
    
    // Cache fetched opportunities
    setSessionData(opportunities);
    return opportunities;
};

// Update an opportunity
export const updateOpportunity = async (
  opportunityId: string, opportunity: Partial<OpportunityType>
): Promise<void> => {
    const userId = getUserId();
    const opportunityRef = doc(db, 'users', userId, 'opportunities', 
                               opportunityId);
    await updateDoc(opportunityRef, opportunity);
    
    // Update session storage
    const cachedOpportunities = getSessionData();
    if (cachedOpportunities) {
        const updatedOpportunities = cachedOpportunities.map((o: 
          OpportunityType) =>
          o.id === opportunityId ? { ...o, ...opportunity } : o
        );
        setSessionData(updatedOpportunities);
    }
};

// Delete an opportunity
export const deleteOpportunity = async (
  opportunityId: string
): Promise<void> => {
    const userId = getUserId();
    const opportunityRef = doc(db, 'users', userId, 'opportunities', 
                               opportunityId);
    await deleteDoc(opportunityRef);
    
    // Remove from session storage
    const cachedOpportunities = getSessionData();
    if (cachedOpportunities) {
        const updatedOpportunities = cachedOpportunities.filter((o: 
          OpportunityType) => o.id !== opportunityId);
        setSessionData(updatedOpportunities);
    }
};
