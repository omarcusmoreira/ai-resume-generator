import { OpportunityType } from "@/types/opportunities";
import { db } from "@/firebaseConfig";
import { 
    doc, setDoc, updateDoc, deleteDoc, 
    collection, getDocs, 
  } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const getUserId = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return currentUser.uid;
};
export const addOpportunity = async (opportunityId: string, opportunity: OpportunityType): Promise<void> => {
    const userId = getUserId();
    const opportunitiesCollection = collection(db, 'users', userId, 'opportunities');
    const docRef = doc(opportunitiesCollection, opportunityId);
    const updatedOpportunity = { ...opportunity, id: opportunityId };
    await setDoc(docRef, updatedOpportunity);
  };    
  
// Get all opportunities for a specific profile
export const getOpportunities = async (): Promise<OpportunityType[]> => {
    const userId = getUserId();
    const opportunitiesCollection = collection(db, 'users', userId, 'opportunities');
    const opportunitiesSnap = await getDocs(opportunitiesCollection);
    return opportunitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as OpportunityType));
  };
  
  // Update an opportunity
  export const updateOpportunity = async (opportunityId: string, opportunity: Partial<OpportunityType>): Promise<void> => {
    const userId = getUserId();
    const opportunityRef = doc(db, 'users', userId, 'opportunities', opportunityId);
    await updateDoc(opportunityRef, opportunity);
  };
  
  // Delete an opportunity
  export const deleteOpportunity = async (opportunityId: string): Promise<void> => {
    const userId = getUserId();
    const opportunityRef = doc(db, 'users', userId, 'opportunities', opportunityId);
    await deleteDoc(opportunityRef);
  };