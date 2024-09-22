import { db } from "@/firebaseConfig";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { PlanHistory } from "@/types/planHistory";

const getUserId = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return currentUser.uid;
};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toPlainObject);
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plainObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      plainObj[key] = toPlainObject(obj[key]);
    }
  }
  return plainObj;
}

export const addPlanHistory = async (planHistoryId: string, planHistory: PlanHistory): Promise<void> => {
    const userId = getUserId();
    const planHistoryCollection = collection(db, 'users', userId, 'planHistory');
    const docRef = doc(planHistoryCollection, planHistoryId);
    
    // Convert planHistory to a plain object, including nested objects
    const plainPlanHistory = toPlainObject(planHistory);
    await setDoc(docRef, plainPlanHistory);
  };

export const getPlanHistory = async (): Promise<PlanHistory[]> => {
    const userId = getUserId();
    const planHistoryCollection = collection(db, 'users', userId, 'planHistory');
    const planHistorySnap = await getDocs(planHistoryCollection);
    return planHistorySnap.docs.map((doc) => doc.data() as PlanHistory);
  };

  export const getLatestPlanHistory = async (): Promise<PlanHistory | null> => {
    try {
      const userId = getUserId(); // Assuming you have a function that retrieves the current user ID
      const planHistoryCollection = collection(db, 'users', userId, 'planHistory');
  
      // Create a query to order by planChangeDate in descending order and limit to 1
      const planHistoryQuery = query(planHistoryCollection, orderBy('planChangeDate', 'desc'), limit(1));
      
      // Get the documents from the query
      const planHistorySnap = await getDocs(planHistoryQuery);
  
      // If there are no documents, return null
      if (planHistorySnap.empty) {
        return null;
      }
  
      // Map the first document to a PlanHistory instance and return it
      const latestPlanDoc = planHistorySnap.docs[0];
      return latestPlanDoc.data() as PlanHistory;
  
    } catch (error) {
      console.error("Error retrieving latest plan history:", error);
      return null;
    }
  };

export const updatePlanHistory = async (planHistoryId: string, planHistory: Partial<PlanHistory>): Promise<void> => {
    const userId = getUserId();
    const planHistoryRef = doc(db, 'users', userId, 'planHistory', planHistoryId);
    await updateDoc(planHistoryRef, planHistory);
  };

export const deletePlanHistory = async (planHistoryId: string): Promise<void> => {
    const userId = getUserId();
    const planHistoryRef = doc(db, 'users', userId, 'planHistory', planHistoryId);
    await deleteDoc(planHistoryRef);
  };
