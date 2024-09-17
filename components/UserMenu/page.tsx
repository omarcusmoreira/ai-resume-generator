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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditCard, HelpCircle, LogOut, Settings, User, Sparkles, HeartHandshake } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebaseConfig'
import Link from 'next/link'

export default function UserMenu({profilePicture, userName, plan}: {profilePicture: string, userName: string, plan: string}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity mb-4 rounded-full">
                {profilePicture ? (
                        <AvatarImage
                            src={profilePicture}
                            alt="User Profile"
                            className={`h-6 w-6 rounded-full mb-2 ${
                                plan === 'pro' ? 'border-2 border-purple-500' :
                                        plan === 'premium' ? 'border-2 border-pink-500' :
                                        'border-2 border-purple-500'
                                    }`}
                                    />
                                ) : (
								<AvatarFallback className="h-20 w-20 rounded-full">
                  {userName ? userName[0].toUpperCase()
                    : 'U'}
                </AvatarFallback>
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
        <div className="bg-secondary p-3 rounded-md mx-1 my-2">
          <p className="text-sm font-medium">Running out of messages?</p>
          <p className="text-xs text-muted-foreground mb-2">Upgrade to Premium for higher limits.</p>
          <Button className="w-full" variant="default">
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Pricing
        </DropdownMenuItem>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          v0.dev
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          Discord
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-100">
          <LogOut className="mr-2 h-4 w-4" onClick={handleLogout}/>
          Sign Out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">MeContrata.Ai</p>
            <HeartHandshake />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}