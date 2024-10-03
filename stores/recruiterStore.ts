import { create } from 'zustand';
import { RecruiterType } from "@/types/recruiter";
import { getRecruiters, addRecruiter, updateRecruiter, deleteRecruiter } from "@/services/recruiterService";

interface RecruiterState {
  recruiters: RecruiterType[];
  loading: boolean;
  error: string | null;
  fetchRecruiters: () => Promise<void>;
  addRecruiter: (RecruiterId: string, Recruiter: RecruiterType) => Promise<void>;
  updateRecruiter: (Recruiter: Partial<RecruiterType>) => Promise<void>;
  deleteRecruiter: (RecruiterId: string) => Promise<void>;
}

export const useRecruiterStore = create<RecruiterState>((set) => ({
  recruiters: [],
  loading: false,
  error: null,

  fetchRecruiters: async () => {
    set({ loading: true, error: null });
    try {
      const recruiters = await getRecruiters();
      set({ recruiters, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addRecruiter: async (recruiterId: string, recruiter: RecruiterType) => {
    set({ loading: true, error: null });
    console.log('Trying to add recruiter (from store)', recruiter)
    try {
      await addRecruiter(recruiterId, recruiter);
      set((state) => ({
        recruiters: [...state.recruiters, { ...recruiter, id: recruiterId }],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      console.log
    }
  },

  updateRecruiter: async (recruiter: Partial<RecruiterType>) => {
    set({ loading: true, error: null });
    try {
      await updateRecruiter(recruiter);
      set((state) => ({
        recruiters: state.recruiters.map((r) =>
          r.id === recruiter.id ? { ...r, ...recruiter } : r
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteRecruiter: async (recruiterId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteRecruiter(recruiterId);
      set((state) => ({
        recruiters: state.recruiters.filter((c) => c.id !== recruiterId),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
