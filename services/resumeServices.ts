import { db } from '@/firebaseConfig';
import { 
  doc, setDoc, updateDoc, deleteDoc, 
  collection, getDocs, 
  getDoc 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ResumeType } from '@/types/resumes';

// Helper function to get the current user's ID
const getUserId = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated - resumeServices');
  }
  return currentUser.uid;
};

const SESSION_KEY = 'userResumes';

// Function to get resumes from session storage
const getSessionData = () => {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

// Function to set resumes in session storage
const setSessionData = (data: ResumeType[]) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
};

// Add a new resume
export const addResume = async (resumeId: string, resume: ResumeType): Promise<void> => {
  const userId = getUserId();
  const resumesCollection = collection(db, 'users', userId, 'resumes');
  const docRef = doc(resumesCollection, resumeId);
  const updatedResume = { ...resume, id: resumeId };
  await setDoc(docRef, updatedResume);
  
  // Update session storage
  const cachedResumes = getSessionData() || [];
  setSessionData([...cachedResumes, updatedResume]);
};

// Get all resumes for a specific profile
export const getResumes = async (): Promise<ResumeType[]> => {
  const cachedResumes = getSessionData();
  if (cachedResumes) {
    return cachedResumes; // Return cached data if available
  }

  const userId = getUserId();
  const resumesCollection = collection(db, 'users', userId, 'resumes');
  const resumesSnap = await getDocs(resumesCollection);
  const resumes = resumesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeType));
  
  // Cache fetched data
  setSessionData(resumes);
  return resumes;
};

// Get a single resume by ID
export const getResume = async (resumeId: string): Promise<ResumeType | null> => {
  const cachedResumes = getSessionData();
  const resumeFromCache = cachedResumes?.find((resume: ResumeType) => resume.id === resumeId);
  if (resumeFromCache) {
    return resumeFromCache; // Return cached data if available
  }

  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  const resumeSnap = await getDoc(resumeRef);
  return resumeSnap.exists() ? (resumeSnap.data() as ResumeType) : null;
};

// Update a resume
export const updateResume = async (resumeId: string, resume: Partial<ResumeType>): Promise<void> => {
  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await updateDoc(resumeRef, resume);
  
  // Update session storage
  const cachedResumes = getSessionData();
  if (cachedResumes) {
    const updatedResumes = cachedResumes.map((r: ResumeType) =>
      r.id === resumeId ? { ...r, ...resume } : r
    );
    setSessionData(updatedResumes);
  }
};

// Delete a resume
export const deleteResume = async (resumeId: string): Promise<void> => {
  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await deleteDoc(resumeRef);
  
  // Remove from session storage
  const cachedResumes = getSessionData();
  if (cachedResumes) {
    const updatedResumes = cachedResumes.filter((r: ResumeType) => r.id !== resumeId);
    setSessionData(updatedResumes);
  }
};
