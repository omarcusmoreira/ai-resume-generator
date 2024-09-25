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
      throw new Error('User not authenticated - profileServices');
    }
    return currentUser.uid;
};

const SESSION_KEY = 'userProfiles';

// Function to get profiles from session storage
const getSessionData = () => {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
};

// Function to set profiles in session storage
const setSessionData = (data: ProfileType[]) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

// Add a new profile
export const addProfile = async (profileId: string, profile: ProfileType): Promise<void> => {
    const userId = getUserId();
    const profilesCollection = collection(db, 'users', userId, 'profiles');
    const docRef = doc(profilesCollection, profileId);
    const updatedProfile = { ...profile, id: profileId };
    await setDoc(docRef, updatedProfile);
    // Update session storage
    const cachedProfiles = getSessionData() || [];
    setSessionData([...cachedProfiles, updatedProfile]);
};

// Get all profiles for the user
export const getProfiles = async (): Promise<ProfileType[]> => {
    const cachedProfiles = getSessionData();
    if (cachedProfiles) {
        return cachedProfiles; // Return cached data if available
    }

    const userId = getUserId();
    const profilesCollection = collection(db, 'users', userId, 'profiles');
    const profilesSnap = await getDocs(profilesCollection);
    const profiles = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileType));
    
    // Cache fetched data
    setSessionData(profiles);
    return profiles;
};

// Update an existing profile
export const updateProfile = async (profile: Partial<ProfileType>): Promise<void> => {
    const userId = getUserId();
    const profileRef = doc(db, 'users', userId, 'profiles', profile.id || '');
    await updateDoc(profileRef, profile);
    
    // Update session storage
    const cachedProfiles = getSessionData();
    if (cachedProfiles) {
        const updatedProfiles = cachedProfiles.map((p: ProfileType) =>
            p.id === profile.id ? { ...p, ...profile } : p
        );
        setSessionData(updatedProfiles);
    }
};

// Delete a profile
export const deleteProfile = async (profileId: string): Promise<void> => {
    const userId = getUserId();
    const profileRef = doc(db, 'users', userId, 'profiles', profileId);
    await deleteDoc(profileRef);
    
    // Remove from session storage
    const cachedProfiles = getSessionData();
    if (cachedProfiles) {
        const updatedProfiles = cachedProfiles.filter((p: ProfileType) => p.id !== profileId);
        setSessionData(updatedProfiles);
    }
};
