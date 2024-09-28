import { create } from 'zustand';
import { ContactType } from "@/types/contacts";
import { getContacts, addContact, updateContact, deleteContact } from "@/services/contactService";

interface ContactState {
  contacts: ContactType[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  addContact: (contactId: string, contact: ContactType) => Promise<void>;
  updateContact: (contact: Partial<ContactType>) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  loading: false,
  error: null,

  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      const contacts = await getContacts();
      set({ contacts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addContact: async (contactId: string, contact: ContactType) => {
    set({ loading: true, error: null });
    try {
      await addContact(contactId, contact);
      set((state) => ({
        contacts: [...state.contacts, { ...contact, id: contactId }],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateContact: async (contact: Partial<ContactType>) => {
    set({ loading: true, error: null });
    try {
      await updateContact(contact);
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contact.id ? { ...c, ...contact } : c
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteContact: async (contactId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteContact(contactId);
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== contactId),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
