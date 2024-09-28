'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Progress } from '@/components/ui/progress';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore(); 
  const router = useRouter();
  const [progress, setProgress] = useState(17); 

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 20;
        }
        clearInterval(timer); 
        return prev;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/landing-page'); // Redirect to landing page if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <Progress value={progress} className='w-1/3 h-1' />
      </div>
    ); // Show progress bar while loading
  }

  return user ? <>{children}</> : null; // Render children if authenticated
}
