'use client';

import { usePathname } from 'next/navigation'; // Import usePathname
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import Sidebar from "@/components/Sidebar/page";
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PlusSquare, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../public/assets/images/logo_quadrado.ico';
import UserMenu from '@/components/UserMenu/page';
import { useFirestore } from '@/hooks/useFirestore';

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
  const { appState } = useFirestore();

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
        {pathname !== '/auth-page' && pathname !== '/landing-page' && (
          <nav className="z-50 md:hidden fixed bottom-4 left-4 right-4 bg-pink-50 border-2 border-purple-200 rounded-full shadow-lg p-2 flex justify-around items-center">
            <Link href="/generate-resume" passHref>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <PlusSquare className={pathname === "/generate-resume" ? "h-5 w-5 text-purple-500" : "h-5 w-5 text-gray-500"} />
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
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <LayoutDashboard className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="w-10 h-10 flex items-center justify-center">
              <UserMenu profilePicture={appState?.userType.personalInfo.profilePicture} userName={appState?.userType.personalInfo.name} plan={appState?.userType.adminInfo.plan} />
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}