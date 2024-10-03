'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunitiesTab } from './opportunities-tab';
import Dashboard from './dashboard';
import RecruiterTab from "./recruiters-tab";

export default function JobTrackerDashboard() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
      <main className="max-w-7xl mx-auto py-6 px-2 sm:px-0">
        <Tabs defaultValue="opportunities" className="mt-6">
          <TabsList className='sm:mx-4'>
            <TabsTrigger value="opportunities">Processos</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList> 
          <TabsContent value="opportunities" className='sm:m-4'>
            <OpportunitiesTab />
          </TabsContent>
          <TabsContent value="contacts" className='sm:m-4'>
            <RecruiterTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
