// stores/planHistoryStore.ts
import { create } from 'zustand';
import { PlanHistory, PlanTypeEnum, PlanChangeTypeEnum, createPlanHistoryObject } from '@/types/planHistory';
import {
  addPlanHistory as apiAddPlanHistory,
  getPlanHistory as apiGetPlanHistory,
  updatePlanHistory as apiUpdatePlanHistory,
  deletePlanHistory as apiDeletePlanHistory,
  getCurrentPlan as apiGetCurrentPlan,
} from '@/services/planHistoryService';
import { Timestamp } from 'firebase/firestore';
import { v4 } from 'uuid';

interface PlanHistoryStore {
  planHistory: PlanHistory[];
  currentPlan: PlanTypeEnum;
  loading: boolean;
  fetchPlanHistory: () => Promise<void>;
  fetchCurrentPlan: () => Promise<void>;
  addPlanHistory: (userId: string, planHistoryId: string, planHistory: PlanHistory) => Promise<void>;
  updatePlanHistory: (planHistoryId: string, planHistory: Partial<PlanHistory>) => Promise<void>;
  deletePlanHistory: (planHistoryId: string) => Promise<void>;
  checkAndRenewPlan: (userId: string) => Promise<boolean>;
}

export const usePlanHistoryStore = create<PlanHistoryStore>((set, get) => ({
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
      const { currentPlan, planHistory } = await apiGetCurrentPlan();
      set({ currentPlan, planHistory });
    } finally {
      set({ loading: false });
    }
  },
  
  addPlanHistory: async (userId: string, planHistoryId: string, planHistory: PlanHistory) => {
    await apiAddPlanHistory(userId, planHistoryId, planHistory);
    set((state) => ({ 
      planHistory: [...state.planHistory, planHistory],
      currentPlan: planHistory.plan
    }));
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

  checkAndRenewPlan: async (userId: string) => {
    const state = get();
    if (state.planHistory.length === 0) {
      await state.fetchPlanHistory();
    }
    
    const currentPlan = state.planHistory[state.planHistory.length - 1];
    const now = Timestamp.now();

    if (now.toMillis() > currentPlan.expirationDate.toMillis()) {
      
      console.log('Plan expired. Renewing planHistory...')
      const newPlanHistory = new PlanHistory({
        id: v4(),
        plan: PlanTypeEnum.FREE,
        changeType: PlanChangeTypeEnum.FREE_RENEWAL,
        amountPaid: 0,
      });
      
      await state.addPlanHistory(userId, newPlanHistory.id, newPlanHistory);
      return true;
    }

    return false;
  },
}));