// components/MobileNavbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusSquare, Users, Files } from 'lucide-react';
import Image from 'next/image';
import logo from '../../public/assets/images/logo_quadrado.ico';
import UserMenu from '@/components/UserMenu';
import { usePathname } from 'next/navigation';

const MobileNavbar: React.FC = () => {
  const pathname = usePathname();

  return (
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
      <Link href="/job-tracker" passHref>
        <div className="w-10 h-10 relative">
          <Image src={logo} alt="Logo" layout="fill" objectFit="contain" />
        </div>
      </Link>
      <Link href="/resume-manager" passHref>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <Files className="h-5 w-5 text-gray-500" />
        </Button>
      </Link>
      <div className="w-10 h-10 flex items-center justify-center">
        <UserMenu />
      </div>
    </nav>
  );
};

export default MobileNavbar;
