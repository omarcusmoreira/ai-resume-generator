import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, LogOut, Settings, Sparkles, Crown, Bug } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import Link from 'next/link';
import AvatarPlaceholder from '@/public/assets/images/avatar_placeholder.jpg';
import Image from 'next/image';
import Logo from '@/public/assets/images/logo_horizontal.png';
import { useUserDataStore } from '@/stores/userDataStore';
import { usePlanHistoryStore } from '@/stores/planHistoryStore';
import { PlanTypeEnum } from '@/types/planHistory';
import CheckoutButton from '../CheckoutButton';

export default function UserMenu() {
    const router = useRouter();
    
    // Accessing user data and current plan from Zustand stores
    const { userData } = useUserDataStore();
    const { currentPlan, fetchCurrentPlan } = usePlanHistoryStore();

    React.useEffect(() => {
      fetchCurrentPlan();
      //eslint-disable-next-line
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            sessionStorage.clear();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity rounded-full border-2 border-purple-400">
              {userData?.personalInfo.profilePicture ? (
                <AvatarImage
                  src={userData.personalInfo.profilePicture}
                  alt="User Profile"
                  className={`h-6 w-6 rounded-full`}
                />
              ) : (
                <AvatarImage
                  src={AvatarPlaceholder.src}
                  alt="User Profile"
                  className={`h-6 w-6 rounded-full mb-2`}
                />
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 ml-6" align="end">
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {currentPlan || PlanTypeEnum.FREE}
              </span>
              <Link href='/user-info'>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Open settings</span>
                </Button>
              </Link>
            </div>
            <p className="text-sm text-foreground mt-1">
              {userData?.personalInfo.name}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="bg-pink-50 p-3 rounded-md mx-1 my-2">
            <p className="text-sm font-medium">Acabou as mensagens?</p>
            <p className="text-xs text-muted-foreground mb-2">Faça um upgrade para Premium para aumentar o limite de mensagens.</p>
            <Button className="w-full" variant="ai">
              <Sparkles className="mr-2 h-4 w-4" />
              <CheckoutButton planType={PlanTypeEnum.BASIC}/>
            </Button>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => console.log('Billing clicked')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Cobrança
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => console.log('Pricing clicked')}>
            <Crown className="mr-2 h-4 w-4" />
            Preços
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={'https://forms.gle/9KKkaRSKpsaHNqz67'}>
              <Bug className="mr-2 h-4 w-4" />
              Relatar Problema
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-500 focus:text-red-500 focus:bg-red-100" 
            onSelect={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="p-2">
            <div className="flex items-center justify-between">
              <Image src={Logo} alt="MeContrata.Ai" width={100} height={100} className="h-4" />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
}