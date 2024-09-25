export type ResumeType = {
    id: string;
    resumeName: string;
    profileName: string;
    createdAt: string;
    updatedAt: string;
    isAccepted: boolean;
    contentJSON: string; 
  };

export type ResumeBodyType = {
  summary: string;
  professionalExperience: {
    company: string;
    position: string;
    dates: string;
    responsibilities: string[];
  }[];
  academicBackground: {
    degree: string;
    institution: string;
    graduationYear: string;
  }[];
  languages: {
    language: string;
    fluency: string;
  }[];
  extraCurricular: Record<string, unknown>;
}