import { ProfileType } from "@/types/profiles";
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
      throw new Error('User not authenticated');
    }
    return currentUser.uid;
};

// Add new profile
export const addProfile = async (profileId: string, profile: ProfileType): Promise<void> => {
    const userId = getUserId();
    const profilesCollection = collection(db, 'users', userId, 'profiles');
    const docRef = doc(profilesCollection, profileId);
    const updatedProfile = { ...profile, id: profileId };
    await setDoc(docRef, updatedProfile);
};

// Get all profiles for the user
export const getProfiles = async (): Promise<ProfileType[]> => {
  const userId = getUserId();
  const profilesCollection = collection(db, 'users', userId, 'profiles');
  const profilesSnap = await getDocs(profilesCollection);
  return profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileType));
};
// Update an existing profile
export const updateProfile = async (profile: Partial<ProfileType>): Promise<void> => {
  const userId = getUserId();
  const profileRef = doc(db, 'users', userId, 'profiles', profile.id || '');
  const updatedProfile = { ...profile, id: profile.id };
  await updateDoc(profileRef, updatedProfile);
};

// Delete a profile
export const deleteProfile = async (profileId: string): Promise<void> => {
  const userId = getUserId();
  const profileRef = doc(db, 'users', userId, 'profiles', profileId);
  await deleteDoc(profileRef);
};
