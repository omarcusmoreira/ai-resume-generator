import { db } from '@/firebaseConfig';
import { 
  doc, getDoc, setDoc, updateDoc, deleteDoc, 
  collection, addDoc, Timestamp, getDocs 
} from 'firebase/firestore';
import { getAuth,  } from 'firebase/auth';
import { ProfileType, ResumeType, OpportunityType, AdminInfoType, PersonalInfoType, UserDataType } from '@/types';

// Helper function to get the current user's ID
const getUserId = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return currentUser.uid;
};

// Helper function to update the AdminInfo's updatedAt field
const updateAdminInfoTimestamp = (existingAdminInfo?: AdminInfoType): AdminInfoType => {
  if (!existingAdminInfo) {
    throw new Error('AdminInfo is undefined');
  }
  return {
    ...existingAdminInfo,
    updatedAt: Timestamp.now()
  };
};

/* ------------------ General User State ------------------ */


export const getUser = async (): Promise<UserDataType | null> => {
  const userId = getUserId();
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDataType;
  } else {
    return null;
  }
};  

export const saveUser = async (user: UserDataType): Promise<void> => {
  const userId = getUserId();
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, user);
};

export const updateUser = async (user: Partial<UserDataType>): Promise<void> => {
  const userId = getUserId();
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, user);
};


// Delete AppState
export const deleteAppState = async (): Promise<void> => {
  const userId = getUserId();
  const docRef = doc(db, 'users', userId);
  await deleteDoc(docRef);
};

/* ------------------ AdminInfo ------------------ */

// Update adminInfo
export const updateAdminInfo = async (adminInfo: Partial<AdminInfoType>): Promise<void> => {
  const userId = getUserId();
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const existingAdminInfo = docSnap.data().userType.adminInfo as AdminInfoType;
    const updatedAdminInfo = {
      ...existingAdminInfo,
      ...adminInfo,
      updatedAt: Timestamp.now()
    };
    await updateDoc(docRef, {
      'userType.adminInfo': updatedAdminInfo
    });
  } else {
    throw new Error('User document does not exist');
  }
};

/* ------------------ PersonalInfo ------------------ */

// Update personalInfo
export const updatePersonalInfo = async (personalInfo: Partial<PersonalInfoType>): Promise<void> => {
  const userId = getUserId();
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const existingPersonalInfo = docSnap.data().userType.personalInfo as PersonalInfoType;
    const updatedPersonalInfo = {
      ...existingPersonalInfo,
      ...personalInfo
    };
    await updateDoc(docRef, {
      'userType.personalInfo': updatedPersonalInfo,
      'userType.adminInfo.updatedAt': Timestamp.now()
    });
  } else {
    throw new Error('User document does not exist');
  }
};

/* ------------------ Profiles ------------------ */

// Get all profiles for the user
export const getProfiles = async (): Promise<ProfileType[]> => {
  const userId = getUserId();
  const profilesCollection = collection(db, 'users', userId, 'profiles');
  const profilesSnap = await getDocs(profilesCollection);
  return profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfileType));
};

// Add new profile
export const addProfile = async (profileId: string, profile: ProfileType): Promise<void> => {
  const userId = getUserId();
  const profilesCollection = collection(db, 'users', userId, 'profiles');
  const docRef = doc(profilesCollection, profileId);
  const updatedProfile = { ...profile, id: profileId };
  await setDoc(docRef, updatedProfile);

  console.log('Profile added to Firestore *from firestoreService.ts*', profileId);
};

// Update an existing profile
export const updateProfile = async (profileId: string, profile: Partial<ProfileType>): Promise<void> => {
  const userId = getUserId();
  const profileRef = doc(db, 'users', userId, 'profiles', profileId);
  const updatedProfile = { ...profile, id: profileId };
  await updateDoc(profileRef, updatedProfile);
};

// Delete a profile
export const deleteProfile = async (profileId: string): Promise<void> => {
  const userId = getUserId();
  const profileRef = doc(db, 'users', userId, 'profiles', profileId);
  await deleteDoc(profileRef);
};

/* ------------------ Resumes ------------------ */

// Get all resumes for a specific profile
export const getResumes = async (): Promise<ResumeType[]> => {
  const userId = getUserId();
  const resumesCollection = collection(db, 'users', userId, 'resumes');
  const resumesSnap = await getDocs(resumesCollection);
  return resumesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeType));
};

// Add a new resume
export const addResume = async (resumeId: string, resume: ResumeType): Promise<void> => {
  const userId = getUserId();
  const resumesCollection = collection(db, 'users', userId, 'resumes');
  const docRef = doc(resumesCollection, resumeId);
  const updatedResume = { ...resume, id: resumeId };
  await setDoc(docRef, updatedResume);
};

// Update a resume
export const updateResume = async (resumeId: string, resume: Partial<ResumeType>): Promise<void> => {
  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await updateDoc(resumeRef, { ...resume, updatedAt: Timestamp.now() });
};

// Delete a resume
export const deleteResume = async (resumeId: string): Promise<void> => {
  const userId = getUserId();
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await deleteDoc(resumeRef);
};

/* ------------------ Opportunities ------------------ */

// Get all opportunities for a specific profile
export const getOpportunities = async (): Promise<OpportunityType[]> => {
  const userId = getUserId();
  const opportunitiesCollection = collection(db, 'users', userId, 'opportunities');
  const opportunitiesSnap = await getDocs(opportunitiesCollection);
  return opportunitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as OpportunityType));
};

// Add a new opportunity
export const addOpportunity = async (opportunity: OpportunityType): Promise<void> => {
  const userId = getUserId();
  const opportunitiesCollection = collection(db, 'users', userId, 'opportunities');
  const docRef = doc(opportunitiesCollection, opportunity.id);
  await setDoc(docRef, opportunity);
};

// Update an opportunity
export const updateOpportunity = async (opportunityId: string, opportunity: Partial<OpportunityType>): Promise<void> => {
  const userId = getUserId();
  const opportunityRef = doc(db, 'users', userId, 'opportunities', opportunityId);
  await updateDoc(opportunityRef, { ...opportunity, updatedAt: Timestamp.now() });
};

// Delete an opportunity
export const deleteOpportunity = async (opportunityId: string): Promise<void> => {
  const userId = getUserId();
  const opportunityRef = doc(db, 'users', userId, 'opportunities', opportunityId);
  await deleteDoc(opportunityRef);
};
