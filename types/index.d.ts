import { Timestamp } from 'firebase/firestore';

// Define the fields for text content and AI enhancement
export type FieldsType = {
  content: string;
  aiEnhanced: string;
};

// Define the sections of a profile
export type ProfileSectionType = {
  keywords: FieldsType
  summary:FieldsType
  professionalExperience: FieldsType
  academicBackground: FieldsType
  idioms: FieldsType
  extraCurricular: FieldsType
};

// Define a resume object
export type ResumeType = {
  id: string;
  profileName: string;
  markdownContent: string; // Markdown content
};

// Define contact details for opportunities
export type ContactType = {
  name: string;
  email: string;
  phone: string;
};

// Enum for the status of an opportunity
export enum OpportunityStatusEnum {
  APPLIED = 'applied',
  HR_CONTACT = 'HR contact',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTED = 'rejected',
}

// Define an opportunity object
export type OpportunityType = {
  id: string;
  status: OpportunityStatusEnum;
  company: string;
  contacts: ContactType[];
  preparation: string;
  applicationDate: string;
  notes: string;
  source: string[];
};

// Define a user profile
export type ProfileType = {
  id: string;
  profileName: string;
  sections: ProfileSectionType;
};

// Define personal information of the user
export type PersonalInfoType = {
  name: string;
  cpf: string;
  birthDate: string;
  linkedinURL: string;
  email: string;
  phone: string;
  city: string;
  profilePicture: string;
};
// Define admin-specific information
export type AdminInfoType = {
  createdAt: Timestamp;
  updatedAt: Timestamp; // Use Firebase Timestamp for date fields
  plan: 'free' | 'basic' | 'premium';
  interactionsQuota?: number;
  interactionsUsed?: number;
  profilesQuota?: number;
  profilesUsed?: number;
  resumesQuota?: number;
  resumesUsed?: number;
  opportunitiesQuota?: number;
  opportunitiesUsed?: number;
};

// Define the main user state
export type UserDataType = {
  userId: string;
  adminInfo: AdminInfoType;
  personalInfo: PersonalInfoType;
};

// Define the overall application state
export type AppState = {
  userType: UserType;
  profiles: ProfileType[];
  resumes: ResumeType[]; 
  opportunities: OpportunityType[];   
};
