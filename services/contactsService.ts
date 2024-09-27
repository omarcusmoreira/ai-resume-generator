import { ContactType } from "@/types/contacts"; // Assuming a file for contact types
import { db } from "@/firebaseConfig";
import { 
    doc, setDoc, updateDoc, deleteDoc, 
    collection, getDocs 
} from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const getUserId = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('User not authenticated - contactServices');
    }
    return currentUser.uid;
};

const CONTACT_SESSION_KEY = 'userContacts';

// Function to get contacts from session storage
const getContactSessionData = () => {
    const data = sessionStorage.getItem(CONTACT_SESSION_KEY);
    return data ? JSON.parse(data) : null;
};

// Function to set contacts in session storage
const setContactSessionData = (data: ContactType[]) => {
    sessionStorage.setItem(CONTACT_SESSION_KEY, JSON.stringify(data));
};

// Add a new contact
export const addContact = async (contactId: string, contact: ContactType): Promise<void> => {
    const userId = getUserId();
    const contactsCollection = collection(db, 'users', userId, 'contacts');
    const docRef = doc(contactsCollection, contactId);
    const updatedContact = { ...contact, id: contactId };
    await setDoc(docRef, updatedContact);
    
    // Update session storage
    const cachedContacts = getContactSessionData() || [];
    setContactSessionData([...cachedContacts, updatedContact]);
};

// Get all contacts for the user
export const getContacts = async (): Promise<ContactType[]> => {
    const cachedContacts = getContactSessionData();
    if (cachedContacts) {
        return cachedContacts; // Return cached data if available
    }

    const userId = getUserId();
    const contactsCollection = collection(db, 'users', userId, 'contacts');
    const contactsSnap = await getDocs(contactsCollection);
    const contacts = contactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactType));

    // Cache fetched data
    setContactSessionData(contacts);
    return contacts;
};

// Update an existing contact
export const updateContact = async (contact: Partial<ContactType>): Promise<void> => {
    const userId = getUserId();
    const contactRef = doc(db, 'users', userId, 'contacts', contact.id || '');
    await updateDoc(contactRef, contact);
    
    // Update session storage
    const cachedContacts = getContactSessionData();
    if (cachedContacts) {
        const updatedContacts = cachedContacts.map((c: ContactType) =>
            c.id === contact.id ? { ...c, ...contact } : c
        );
        setContactSessionData(updatedContacts);
    }
};

// Delete a contact
export const deleteContact = async (contactId: string): Promise<void> => {
    const userId = getUserId();
    const contactRef = doc(db, 'users', userId, 'contacts', contactId);
    await deleteDoc(contactRef);

    // Remove from session storage
    const cachedContacts = getContactSessionData();
    if (cachedContacts) {
        const updatedContacts = cachedContacts.filter((c: ContactType) => c.id !== contactId);
        setContactSessionData(updatedContacts);
    }
};
