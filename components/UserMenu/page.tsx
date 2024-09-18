import React from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { CreditCard, LogOut, Settings, Sparkles, HeartHandshake, Crown, Bug } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebaseConfig'
import Link from 'next/link'
import AvatarPlaceholder from '@/public/avatar_placeholder.png'

export default function UserMenu({profilePicture, userName, plan}: {profilePicture: string, userName: string, plan: string}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
            console.log('User signed out');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity mb-4 rounded-full">
          {profilePicture ?  (
            <AvatarImage
              src={profilePicture}
              alt="User Profile"
              className={`h-6 w-6 rounded-full mb-2 ${
                plan === 'free' ? 'border-2 border-gray-800' :
                plan === 'premium' ? 'border-2 border-pink-700' :
                plan === 'pro' ? 'border-2 border-purple-700' :
                  'border-2 border-black'
              }`}
          />
          ) : (
            <AvatarImage
            src={AvatarPlaceholder.src}
            alt="User Profile"
            className={`h-6 w-6 rounded-full mb-2 ${
                plan === 'pro' ? 'border-2 border-purple-500' :
                plan === 'premium' ? 'border-2 border-pink-500' :
                'border-2 border-purple-500'
              }`}
            />
          )}
			</Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 ml-6" align="end">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {plan}
            </span>
            <Link href='/user-info'>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Open settings</span>
            </Button>
            </Link>
          </div>
          <p className="text-sm text-foreground mt-1">
            {userName}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="bg-pink-50 p-3 rounded-md mx-1 my-2">
          <p className="text-sm font-medium">Acabou as mensagens?</p>
          <p className="text-xs text-muted-foreground mb-2">Faça um upgrade para Premium para aumentar o limite de mensagens.</p>
          <Button className="w-full" variant="default">
            <Sparkles className="mr-2 h-4 w-4" />
            Virar Premium
          </Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          Cobrança
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Crown   className="mr-2 h-4 w-4" />
          Preços
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bug   className="mr-2 h-4 w-4" />
          Relatar Problema
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-100" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4"/>
          Sair
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">MeContrata.Ai</p>
            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}