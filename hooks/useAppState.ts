import { useState, useEffect } from 'react';
import { getAppState, saveAppState } from '@/services/firestoreService';

export type PersonalInfo = {
  name: string;
  phone: string;
  address: string;
  birthDate: string;
  email: string;
  linkedin: string;
  picture: string;
};

export type ProfileSection = {
  title: string;
  content: string;
  aiEnhanced: string;
};

export type Profile = {
  name: string;
  sections: ProfileSection[];
};

export type AppState = {
  personalInfo: PersonalInfo;
  profiles: Profile[];
};

const initialPersonalInfo: PersonalInfo = {
  name: "",
  phone: "",
  address: "",
  birthDate: "",
  email: "",
  linkedin: "",
  picture: ""
};

export function useAppState() {
  const [appState, setAppState] = useState<AppState>({
    personalInfo: initialPersonalInfo,
    profiles: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const state = await getAppState();
      if (state) {
        setAppState(state);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const saveState = async () => {
    await saveAppState(appState);
  };

  return [appState, setAppState, saveState, isLoading] as const;
}