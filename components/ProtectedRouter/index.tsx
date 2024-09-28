'use client';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

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
    const isPWA = () => {
      // Check if the app is running in standalone mode
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      );
    };

    if (!loading && !user) {
      if (isPWA()) {
        // If the user is in PWA mode, redirect to auth-page
        router.push('/auth-page');
      } else {
        // Otherwise, redirect to landing-page
        router.push('/landing-page');
      }
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
