import { create } from 'zustand';
import { UserDataType } from '@/types/users';
import { getUserData, updateUser, deleteUser } from '@/services/userServices';

interface UserState {
  userData: UserDataType | null;
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  setUserData: (user: UserDataType) => void;
  updateUserData: (user: UserDataType) => Promise<void>;
  deleteUserData: () => Promise<void>;
}

export const useUserDataStore = create<UserState>((set) => ({
  userData: null,
  loading: false,
  error: null,

  fetchUserData: async () => {
    set({ loading: true, error: null });
    try {
      const userData = await getUserData();
      set({ userData: userData, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setUserData: (userData) => set({ userData }),

  updateUserData: async (userData) => {
    set({ loading: true, error: null });
    try {
      await updateUser(userData);
      set({ userData, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteUserData: async () => {
    set({ loading: true, error: null });
    try {
      await deleteUser(); // No need to pass userId
      set({ userData: null, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
