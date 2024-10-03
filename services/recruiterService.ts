import { RecruiterType } from "@/types/recruiter"; // Assuming a file for Recruitert types
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
        throw new Error('User not authenticated - recruiterServices');
    }
    return currentUser.uid;
};

const RECRUITER_SESSION_KEY = 'userRecruiter';

// Function to get recruiters from session storage
const getRecruiterSessionData = () => {
    const data = sessionStorage.getItem(RECRUITER_SESSION_KEY);
    return data ? JSON.parse(data) : null;
};

// Function to set recruiters in session storage
const setRecruiterSessionData = (data: RecruiterType[]) => {
    sessionStorage.setItem(RECRUITER_SESSION_KEY, JSON.stringify(data));
};

// Add a new recruiter
export const addRecruiter = async (recruiterId: string, recruiter: RecruiterType): Promise<void> => {
    const userId = getUserId();
    const recruitersCollection = collection(db, 'users', userId, 'recruiters');
    const docRef = doc(recruitersCollection, recruiterId);
    const updatedRecruiter = { ...recruiter, id: recruiterId };
    await setDoc(docRef, updatedRecruiter);
    
    // Update session storage
    const cachedRecruiters = getRecruiterSessionData() || [];
    setRecruiterSessionData([...cachedRecruiters, updatedRecruiter]);
};

// Get all recruiters for the user
export const getRecruiters = async (): Promise<RecruiterType[]> => {
    const cachedRecruiter = getRecruiterSessionData();
    if (cachedRecruiter) {
        return cachedRecruiter; // Return cached data if available
    }

    const userId = getUserId();
    const recruitersCollection = collection(db, 'users', userId, 'recruiters');
    const recruitersSnap = await getDocs(recruitersCollection);
    const recruiters = recruitersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecruiterType));

    // Cache fetched data
    setRecruiterSessionData(recruiters);
    return recruiters;
};

// Update an existing recruiter
export const updateRecruiter = async (recruiter: Partial<RecruiterType>): Promise<void> => {
    const userId = getUserId();
    const recruiterRef = doc(db, 'users', userId, 'recruiters', recruiter.id || '');
    await updateDoc(recruiterRef, recruiter);
    
    // Update session storage
    const cachedRecruiters = getRecruiterSessionData();
    if (cachedRecruiters) {
        const updatedRecruiters = cachedRecruiters.map((r: RecruiterType) =>
            r.id === recruiter.id ? { ...r, ...recruiter } : r
        );
        setRecruiterSessionData(updatedRecruiters);
    }
};

// Delete a recruiter
export const deleteRecruiter = async (recruiterId: string): Promise<void> => {
    const userId = getUserId();
    const recruiterRef = doc(db, 'users', userId, 'recruiters', recruiterId);
    await deleteDoc(recruiterRef);

    // Remove from session storage
    const cachedRecruiters = getRecruiterSessionData();
    if (cachedRecruiters) {
        const updatedRecruiters = cachedRecruiters.filter((c: RecruiterType) => c.id !== recruiterId);
        setRecruiterSessionData(updatedRecruiters);
    }
};
