import { create } from 'zustand';
import { OpportunityType } from "@/types/opportunities";
import { getOpportunities, addOpportunity, updateOpportunity, deleteOpportunity } from "@/services/opportunityServices";

interface OpportunityState {
  opportunities: OpportunityType[];
  loading: boolean;
  error: string | null;
  fetchOpportunities: () => Promise<void>;
  addOpportunity: (opportunityId: string, opportunity: OpportunityType) => Promise<void>;
  updateOpportunity: (opportunity: Partial<OpportunityType>) => Promise<void>;
  deleteOpportunity: (opportunityId: string) => Promise<void>;
}

export const useOpportunityStore = create<OpportunityState>((set) => ({
  opportunities: [],
  loading: false,
  error: null,

  fetchOpportunities: async () => {
    set({ loading: true, error: null });
    try {
      const opportunities = await getOpportunities();
      set({ opportunities, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addOpportunity: async (opportunityId: string, opportunity: OpportunityType) => {
    set({ loading: true, error: null });
    try {
      await addOpportunity(opportunityId, opportunity);
      set((state) => ({
        opportunities: [...state.opportunities, { ...opportunity, id: opportunityId }],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateOpportunity: async (opportunity: Partial<OpportunityType>) => {
    set({ loading: true, error: null });
    try {
      await updateOpportunity(opportunity);
      set((state) => ({
        opportunities: state.opportunities.map((o) =>
          o.id === opportunity.id ? { ...o, ...opportunity } : o
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteOpportunity: async (opportunityId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteOpportunity(opportunityId);
      set((state) => ({
        opportunities: state.opportunities.filter((o) => o.id !== opportunityId),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
