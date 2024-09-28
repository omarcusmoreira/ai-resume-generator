'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunitiesTab } from './opportunities-tab';
import ContactsTab from './contacts-tab';
import Dashboard from './dashboard';

export default function JobTrackerDashboard() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="opportunities" className="mt-6">
          <TabsList className='sm:mx-4'>
            <TabsTrigger value="opportunities">Processos</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList> 
          <TabsContent value="opportunities" className='sm:m-4'>
            <OpportunitiesTab />
          </TabsContent>
          <TabsContent value="contacts" className='sm:m-4'>
            <ContactsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
