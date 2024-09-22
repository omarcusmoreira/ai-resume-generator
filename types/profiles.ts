export type ProfileSectionType = {
    keywords: string;
    summary: string;
    professionalExperience: string;
    academicBackground: string;
    idioms: string;
    extraCurricular: string;
};
  

export type ProfileType = {
    id: string;
    profileName: string;
    sections: ProfileSectionType;
};