import { db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { AppState } from '@/hooks/useAppState';

const USER_ID = 'USER_ID'; // Replace with dynamic user ID as needed

export const getAppState = async (): Promise<AppState | null> => {
  const docRef = doc(db, 'users', USER_ID);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as AppState;
  } else {
    console.log('No such document!');
    return null;
  }
};

export const saveAppState = async (appState: AppState): Promise<void> => {
  const docRef = doc(db, 'users', USER_ID);
  await setDoc(docRef, appState);
};

export const updateAppState = async (appState: Partial<AppState>): Promise<void> => {
  const docRef = doc(db, 'users', USER_ID);
  await updateDoc(docRef, appState);
};

export const deleteAppState = async (): Promise<void> => {
  const docRef = doc(db, 'users', USER_ID);
  await deleteDoc(docRef);
};