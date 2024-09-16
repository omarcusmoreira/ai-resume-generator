'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Link from 'next/link';
import { FileText, HeartHandshake, LogOut, Sparkles, User } from "lucide-react";
import { Button } from "./ui/button";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import { useFirestore } from "@/hooks/useFirestore";

export function Sidebar() {
	const router = useRouter();
	const { loading, error, appState } = useFirestore();

	const handleLogout = async () => {
		try {
			await signOut(auth);
			router.push('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	if (loading) {
		return <div className="w-64 bg-white shadow-md">Loading...</div>;
	}

	if (error) {
		return <div className="w-64 bg-white shadow-md">Error: {error}</div>;
	}

	return (
		<div className="w-64 bg-white shadow-md">
			<div className="flex flex-col h-full">
				<div className="p-4 flex flex-col items-center">
					<Link href="/user-info" passHref>
						<Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity mb-4 rounded-full">
							{appState?.userType.personalInfo.profilePicture ? (
								<AvatarImage
									src={appState?.userType.personalInfo.profilePicture}
									alt="User Profile"
									className={`h-20 w-20 rounded-full mb-2 ${
										appState?.userType.adminInfo.plan === 'pro' ? 'border-4 border-gold' :
										appState?.userType.adminInfo.plan === 'premium' ? 'border-4 border-silver' :
										'border-4 border-bronze'
									}`}
								/>
							) : (
								<AvatarFallback className="h-20 w-20 rounded-full">
									{appState?.userType.personalInfo.name
										? appState?.userType.personalInfo.name[0].toUpperCase()
										: 'U'}
								</AvatarFallback>
							)}
						</Avatar>
					</Link>
					<span className="text-sm font-medium text-center">
						{appState?.userType.personalInfo.name || 'User'}
					</span>
				</div>
				<nav className="flex-1 p-4 justify-between h-full">
					<div>
						<Link href="/profile-page" passHref>
							<Button variant="ghost" className="w-full justify-start mb-2 text-button">
								<User className="mr-2 h-4 w-4" />
								Gerenciar Perfil
							</Button>
						</Link>
						<Link href="/resume" passHref>
							<Button variant="ghost" className="w-full justify-start mb-2 text-button">
								<Sparkles className="mr-2 h-4 w-4" />
								Gerador de Currículos
							</Button>
						</Link>
						<Button variant="ghost" className="w-full justify-start mb-2 text-button">
							<HeartHandshake className="mr-2 h-4 w-4 text-blue-700" />
							Processos Seletivos
						</Button>
						<Button variant="ghost" className="w-full justify-start text-button">
							<FileText className="mr-2 h-4 w-4" />
							Gerenciar Currículos
						</Button>
					</div>
					<div>
						<Button
							variant="ghost"
							className="w-full justify-start text-button"
							onClick={handleLogout}
						>
							<LogOut className="mr-2 h-4 w-4" />
							Logout
						</Button>
					</div>
				</nav>
			</div>
		</div>
	);
}