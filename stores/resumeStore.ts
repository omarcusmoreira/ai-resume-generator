import { create } from 'zustand';
import { ResumeType } from "@/types/resumes";
import { getResumes, addResume, updateResume, deleteResume, getResume } from "@/services/resumeServices";

interface ResumeState {
  resumes: ResumeType[];
  loading: boolean;
  error: string | null;
  fetchResumes: () => Promise<void>;
  fetchResumeById: (resumeId: string) => Promise<ResumeType | null>;
  addResume: (resumeId: string, resume: ResumeType) => Promise<void>;
  updateResume: (resumeId: string, resume: Partial<ResumeType>) => Promise<void>;
  deleteResume: (resumeId: string) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  loading: false,
  error: null,

  fetchResumes: async () => {
    set({ loading: true, error: null });
    try {
      const resumes = await getResumes();
      set({ resumes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchResumeById: async (resumeId: string) => {
    set({ loading: true, error: null });
    try {
      const resume = await getResume(resumeId);
      set({ loading: false });
      return resume;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  addResume: async (resumeId: string, resume: ResumeType) => {
    set({ loading: true, error: null });
    try {
      await addResume(resumeId, resume);
      set((state) => ({
        resumes: [...state.resumes, { ...resume, id: resumeId }],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateResume: async (resumeId: string, resume: Partial<ResumeType>) => {
    set({ loading: true, error: null });
    try {
      await updateResume(resumeId, resume);
      set((state) => ({
        resumes: state.resumes.map((r) =>
          r.id === resumeId ? { ...r, ...resume } : r
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteResume: async (resumeId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteResume(resumeId);
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== resumeId),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
