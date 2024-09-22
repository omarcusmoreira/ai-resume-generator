import { UserDataType } from "@/types/users";
import { db } from "@/firebaseConfig";
import { 
    doc, getDoc, setDoc, updateDoc, deleteDoc, 
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

export const addUser = async (user: UserDataType): Promise<void> => {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, user);
};

export const getUser = async (): Promise<UserDataType | null> => {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserDataType : null;
};

export const updateUser = async (user: UserDataType): Promise<void> => {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, user);
};

export const deleteUser = async (): Promise<void> => {
    const userId = getUserId();
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
};
