import { db } from '@/firebaseConfig';
import { 
  doc, setDoc, updateDoc, deleteDoc, 
  collection, getDocs, 
  getDoc
} from 'firebase/firestore';
import { getAuth,  } from 'firebase/auth';
import { ResumeType } from '@/types/resumes';

// Helper function to get the current user's ID
const getUserId = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return currentUser.uid;
};

// Add a new resume
export const addResume = async (resumeId: string, resume: ResumeType): Promise<void> => {
  const userId = getUserId();
  const resumesCollection = collection(db, 'users', userId, 'resumes');
  const docRef = doc(resumesCollection, resumeId);
  const updatedResume = { ...resume, id: resumeId };
  await setDoc(docRef, updatedResume);
};

// Get all resumes for a specific profile
export const getResumes = async (): Promise<ResumeType[]> => {
    const userId = getUserId();
    const resumesCollection = collection(db, 'users', userId, 'resumes');
    const resumesSnap = await getDocs(resumesCollection);
    return resumesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeType));
  };

export const getResume = async (resumeId: string): Promise<ResumeType> => {
  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  const resumeSnap = await getDoc(resumeRef);
  return resumeSnap.data() as ResumeType;
};

// Update a resume
export const updateResume = async (resumeId: string, resume: Partial<ResumeType>): Promise<void> => {
  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await updateDoc(resumeRef, resume);
};

// Delete a resume
export const deleteResume = async (resumeId: string): Promise<void> => {
  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await deleteDoc(resumeRef);
};
