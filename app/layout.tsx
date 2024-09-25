'use client';

import { usePathname } from 'next/navigation'; // Import usePathname
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import Sidebar from "@/components/Sidebar/";
import { Button } from '@/components/ui/button';
import { Files, PlusSquare, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../public/assets/images/logo_quadrado.ico';
import UserMenu from '@/components/UserMenu';
import { useEffect, useState } from 'react';
import { UserDataType } from '@/types/users';
import { getUserData } from '@/services/userServices';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Progress } from '@/components/ui/progress';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <LayoutWithAuth>{children}</LayoutWithAuth>
        </body>
      </html>
    </AuthProvider>
  );
}

function LayoutWithAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const { user, loading } = useAuth();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [fetchedUser] = await Promise.all([
            getUserData(),
          ]);

          setUserData(fetchedUser);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsDataLoaded(true);
        }
      } else if (!loading) {
        setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [user, loading]);

  const [progress, setProgress] = useState(17)
 
  useEffect(() => {
    const timer = setTimeout(() => setProgress(82), 100)
    return () => clearTimeout(timer)
  }, [])

  if (loading || !isDataLoaded) {

    return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <span className='text-sm text-gray-500 mb-4'>carregando...</span>
      <Progress  value={progress} className='w-1/3 h-1' />
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
        
        {/* Floating bottom navbar for mobile */}
        {pathname !== '/auth-page' && pathname !== '/landing-page' && userData && (
          <nav className="z-50 md:hidden fixed bottom-4 left-4 right-4 bg-pink-50 border-2 border-purple-200 rounded-full shadow-lg p-2 flex justify-around items-center">
            <Link href="/resume-generate" passHref>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <PlusSquare className={pathname === "/resume-generate" ? "h-5 w-5 text-purple-500" : "h-5 w-5 text-gray-500"} />
              </Button>
            </Link>
            <Link href="/profile-manager" passHref>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Users className={pathname === "/profile-manager" ? "h-5 w-5 text-purple-500" : "h-5 w-5 text-gray-500"} />
              </Button>
            </Link>
            <div className="w-10 h-10 relative">
              <Image src={logo} alt="Logo" layout="fill" objectFit="contain" />
            </div>
            <Link href="/resume-manager" passHref>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Files className="h-5 w-5 text-gray-500" />
            </Button>
            </Link>
            <div className="w-10 h-10 flex items-center justify-center">
              <UserMenu/>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}