import { create } from 'zustand';
import { getQuotas, getQuotaByType, incrementQuota, decrementQuota } from '@/services/quotaServices';
import { QuotasType } from "@/types/planHistory";

interface QuotaState {
  quotas: QuotasType;
  loading: boolean;
  error: string | null;
  fetchQuotas: () => Promise<void>;
  fetchQuotaByType: (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters') => Promise<number>;
  increaseQuota: (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters') => Promise<void>;
  decreaseQuota: (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters') => Promise<void>;
}

export const useQuotaStore = create<QuotaState>((set) => ({
  quotas: {
    profiles: null,
    resumes: null,
    opportunities: null,
    interactions: null,
    recruiters: null,
  },
  loading: false,
  error: null,

  fetchQuotas: async () => {
    set({ loading: true, error: null });
    try {
      const quotas = await getQuotas();
      set({ quotas, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchQuotaByType: async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters') => {
    set({ loading: true, error: null });
    try {
      const quota = await getQuotaByType(quotaType);
      set({ loading: false });
      return quota;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return 0; // Return 0 in case of error
    }
  },

  increaseQuota: async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters') => {
    set({ loading: true, error: null });
    try {
      await incrementQuota(quotaType);
      
      set((state) => {
        const currentQuota = state.quotas[quotaType];
  
        // Check if the quota is not null or undefined before incrementing
        if (currentQuota === null || currentQuota === undefined) {
          return {
            ...state,
            loading: false,
            error: `Cannot increment. Quota for ${quotaType} is not available.`,
          };
        }
  
        return {
          quotas: {
            ...state.quotas,
            [quotaType]: currentQuota + 1,
          },
          loading: false,
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  

  decreaseQuota: async (quotaType: 'profiles' | 'resumes' | 'opportunities' | 'interactions' | 'recruiters') => {
    set({ loading: true, error: null });
    try {
      await decrementQuota(quotaType);
      
      set((state) => {
        const currentQuota = state.quotas[quotaType];
        
        // Check if the quota is not null before performing the decrement
        if (currentQuota === null || currentQuota === undefined) {
          return {
            ...state,
            loading: false,
            error: `Cannot decrement. Quota for ${quotaType} is not available.`,
          };
        }
        
        return {
          quotas: {
            ...state.quotas,
            [quotaType]: currentQuota - 1,
          },
          loading: false,
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
}));
