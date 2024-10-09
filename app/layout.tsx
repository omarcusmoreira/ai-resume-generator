'use client';

import { usePathname } from 'next/navigation';
import "./globals.css";
import Sidebar from "@/components/Sidebar/";
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useAuthStore, initializeAuth } from '@/stores/authStore';
import MobileNavbar from '@/components/MobileNavbar'; 
import { useUserDataStore } from '@/stores/userDataStore';
import { useProfileStore } from '@/stores/profileStore';
import { useResumeStore } from '@/stores/resumeStore';
import { useQuotaStore } from '@/stores/quotaStore';
import { usePlanHistoryStore } from '@/stores/planHistoryStore';
import { useOpportunityStore } from '@/stores/opportunityStore';
import { useRecruiterStore } from '@/stores/recruiterStore';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        {/* Meta tags para PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Crie currículos com IA e gerencie seus processos seletivos com o MeContrata.ai" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <ToastProvider>
          <LayoutWithAuth>{children}</LayoutWithAuth>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}

function LayoutWithAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuthStore();
  const { fetchUserData } = useUserDataStore();
  const { fetchProfiles } = useProfileStore();
  const { fetchResumes } = useResumeStore();
  const { quotas, fetchQuotas } = useQuotaStore();
  const { fetchRecruiters } = useRecruiterStore();
  const { fetchCurrentPlan } = usePlanHistoryStore();
  const { fetchOpportunities } = useOpportunityStore();

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (user && !loading) {  // Ensure data is fetched after login
        try {
          await Promise.all([
            fetchUserData(),
            fetchResumes(),
            fetchProfiles(),
            fetchQuotas(),
            fetchCurrentPlan(),
            fetchOpportunities(),
            fetchRecruiters(),
          ]);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsDataLoaded(true);
        }
      } else if (!loading) {
        setIsDataLoaded(true);  // Set loaded to true if user is not logged in
      }
    };
  
    fetchData();
  }, [user, loading, fetchUserData, fetchResumes, fetchProfiles, fetchQuotas, fetchCurrentPlan, fetchOpportunities, fetchRecruiters]); // Dependencies should include fetch functions

  const [progress, setProgress] = useState(17);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(82), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !isDataLoaded || !quotas) {
        return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <span className='text-sm text-gray-500 mb-4'>carregando...</span>
        <Progress value={progress} className='w-1/3 h-1' />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      {pathname !== '/auth-page' && pathname !== '/landing-page' && (
        <div className="hidden md:block w-10 bg-gray-100 border-r border-gray-200">
          <Sidebar />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {children}

        {pathname !== '/auth-page' && pathname !== '/landing-page' && (
          <MobileNavbar />
        )}
      </div>
    </div>
  );
}
