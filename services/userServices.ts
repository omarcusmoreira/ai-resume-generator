import { UserDataType } from "@/types/users";
import { db } from "@/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const getUserId = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated - userServices');
    }
    return currentUser.uid;
};

const SESSION_KEY = 'userData';

export const getSessionData = (key: string) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

export const setSessionData = (key: string, data: UserDataType) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

export const addUser = async (user: UserDataType): Promise<void> => {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, user);
    
    setSessionData(SESSION_KEY, user); // Update session storage after adding user
};

export const getUserData = async (): Promise<UserDataType | null> => {
    const cachedUser = getSessionData(SESSION_KEY);
    if (cachedUser) {
        return cachedUser; // Return cached data if available
    }

    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const userData = docSnap.data() as UserDataType;
        setSessionData(SESSION_KEY, userData); // Cache fetched data
        return userData;
    }
    return null;
};

// New function to get a user by their ID
export const getUserById = async (userId: string): Promise<UserDataType | null> => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data() as UserDataType; // Return user data if exists
    }
    return null;
}

export const updateUser = async (user: UserDataType): Promise<void> => {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, user);
    setSessionData(SESSION_KEY, user); // Update session storage after updating user
};

export const deleteUser = async (): Promise<void> => {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
    sessionStorage.removeItem(SESSION_KEY); // Clear session storage on delete
};

export const getUserByStripeCustomerId = async (stripeCustomerId: string) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("stripeCustomerId", "==", stripeCustomerId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    };
  }