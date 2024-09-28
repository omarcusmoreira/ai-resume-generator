'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OpportunityType } from '@/types/opportunities'
import { ContactType } from '@/types/contacts'
import { getContacts } from '@/services/contactsService'
import { getProfiles } from '@/services/profileServices'
import { ProfileType } from '@/types/profiles'
import { ResumeType } from '@/types/resumes'
import { getResumes } from '@/services/resumeServices'
import { getOpportunities } from '@/services/opportunityServices'
import { OpportunitiesTab } from './opportunities-tab'
import ContactsTab from './contacts-tab'
import Dashboard from './dashboard'

export default function JobTrackerDashboard() {
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [profiles, setProfiles] = useState<ProfileType[]>([])
  const [resumes, setResumes] = useState<ResumeType[]>([])
  const [opportunities, setOpportunities] = useState<OpportunityType[]>([])

useEffect(() => {

    const fetchContacts = async () => {
        try {
        const fetchedContacts = await getContacts();
        const fetchedProfiles = await getProfiles();
        const fetchedResumes = await getResumes();
        const fetchOpportunities = await getOpportunities();

        setContacts(fetchedContacts);
        setProfiles(fetchedProfiles);
        setResumes(fetchedResumes);
        setOpportunities(fetchOpportunities);

        } catch (error) {
        console.error('Error fetching contacts:', error);
        }
    };

  fetchContacts();
}, []);


  return (
    <div className="min-h-screen bg-gray-50">
        <Dashboard opportunities={opportunities} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="opportunities" className="mt-6">
          <TabsList className='sm:mx-4'>
            <TabsTrigger value="opportunities">Processos</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList> 
            <TabsContent value="opportunities" className='sm: m-4'>
                <OpportunitiesTab 
                    contacts={contacts}
                    resumes={resumes}
                    profiles={profiles}
                    opportunities={opportunities}
                    setOpportunities={setOpportunities}
                />
            </TabsContent>
          <TabsContent value="contacts" className='sm: m-4'>
            <ContactsTab
                contacts={contacts}
                setContacts={setContacts}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}