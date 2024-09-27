export type PersonalInfoType = {
    name: string;
    cpf?: string;
    birthDate?: string;
    linkedinURL?: string;
    email: string;
    phone?: string;
    city?: string;
    profilePicture?: string;
  };
  
  export type UserDataType = {
    userId: string;
    personalInfo: PersonalInfoType;
    stripeCustomerId?:string; 
  };