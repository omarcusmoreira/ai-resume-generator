'use client';

import { usePathname } from 'next/navigation'; // Import usePathname
import "./globals.css";
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LandingPage from './landing-page/page';
import { Sidebar } from "@/components/sidebar";
import AuthPage from './auth-page/page';

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
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user && pathname !== '/auth-page') {
    return <LandingPage />;
  }

  if (user && pathname === '/auth-page') {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
