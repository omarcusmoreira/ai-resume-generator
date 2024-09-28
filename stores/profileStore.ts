import { create } from 'zustand';
import {
    addProfile as addProfileService,
    getProfiles as getProfilesService,
    updateProfile as updateProfileService,
    deleteProfile as deleteProfileService
} from '@/services/profileServices';
import { ProfileType } from '@/types/profiles';

interface ProfileState {
    profiles: ProfileType[];
    loading: boolean;
    error: string | null;
    fetchProfiles: () => Promise<void>;
    addProfile: (profileId: string, profile: ProfileType) => Promise<void>;
    updateProfile: (profile: Partial<ProfileType>) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
    profiles: [],
    loading: false,
    error: null,

    fetchProfiles: async () => {
        set({ loading: true, error: null });
        try {
            const profiles = await getProfilesService();
            set({ profiles, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    addProfile: async (profileId: string, profile: ProfileType) => {
        set({ loading: true, error: null });
        try {
            await addProfileService(profileId, profile);
            set((state) => ({
                profiles: [...state.profiles, { ...profile, id: profileId }],
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    updateProfile: async (profile: Partial<ProfileType>) => {
        set({ loading: true, error: null });
        try {
            await updateProfileService(profile);
            set((state) => ({
                profiles: state.profiles.map((p) =>
                    p.id === profile.id ? { ...p, ...profile } : p
                ),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    deleteProfile: async (profileId: string) => {
        set({ loading: true, error: null });
        try {
            await deleteProfileService(profileId);
            set((state) => ({
                profiles: state.profiles.filter((p) => p.id !== profileId),
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },
}));
