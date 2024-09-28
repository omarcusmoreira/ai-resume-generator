// stores/planHistoryStore.ts
import { create } from 'zustand';
import { PlanHistory, PlanTypeEnum } from '@/types/planHistory';
import {
  addPlanHistory as apiAddPlanHistory,
  getPlanHistory as apiGetPlanHistory,
  updatePlanHistory as apiUpdatePlanHistory,
  deletePlanHistory as apiDeletePlanHistory,
  getCurrentPlan as apiGetCurrentPlan,
} from '@/services/planHistoryService';

interface PlanHistoryStore {
  planHistory: PlanHistory[];
  currentPlan: PlanTypeEnum;
  loading: boolean;
  fetchPlanHistory: () => Promise<void>;
  fetchCurrentPlan: () => Promise<void>;
  addPlanHistory: (planHistoryId: string, planHistory: PlanHistory) => Promise<void>;
  updatePlanHistory: (planHistoryId: string, planHistory: Partial<PlanHistory>) => Promise<void>;
  deletePlanHistory: (planHistoryId: string) => Promise<void>;
}

export const usePlanHistoryStore = create<PlanHistoryStore>((set) => ({
  planHistory: [],
  currentPlan: PlanTypeEnum.FREE,
  loading: false,
  
  fetchPlanHistory: async () => {
    set({ loading: true });
    try {
      const history = await apiGetPlanHistory();
      set({ planHistory: history });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchCurrentPlan: async () => {
    set({ loading: true });
    try {
      const plan = await apiGetCurrentPlan();
      set({ currentPlan: plan });
    } finally {
      set({ loading: false });
    }
  },
  
  addPlanHistory: async (planHistoryId: string, planHistory: PlanHistory) => {
    await apiAddPlanHistory(planHistoryId, planHistory);
    set((state) => ({ planHistory: [...state.planHistory, planHistory] }));
  },
  
  updatePlanHistory: async (planHistoryId: string, planHistory: Partial<PlanHistory>) => {
    await apiUpdatePlanHistory(planHistoryId, planHistory);
    set((state) => ({
      planHistory: state.planHistory.map((ph) => (ph.id === planHistoryId ? { ...ph, ...planHistory } : ph)),
    }));
  },

  deletePlanHistory: async (planHistoryId: string) => {
    await apiDeletePlanHistory(planHistoryId);
    set((state) => ({
      planHistory: state.planHistory.filter((ph) => ph.id !== planHistoryId),
    }));
  },
}));
