'use client';

import { usePathname } from 'next/navigation'; // Import usePathname
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import Sidebar from "@/components/Sidebar/page";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      {pathname !== '/auth-page' && pathname !== '/landing-page' && (
        <div className="hidden md:block w-10 bg-gray-100 border-r border-gray-200">
          <Sidebar />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        {pathname !== '/auth-page' && pathname !== '/landing-page' && (
          <header className="md:hidden flex items-center justify-between p-2 border-b border-gray-200">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[200px] sm:w-[240px] bg-white">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <h1 className="text-l font-semibold">MeContrata.Ai</h1>
            <div className="w-8" /> {/* Placeholder for balance */}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}