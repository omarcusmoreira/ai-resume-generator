import { FileText, LayoutDashboard, PlusSquare, Settings, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { usePathname, useRouter } from "next/navigation";
import { useFirestore } from "@/hooks/useFirestore";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import Link from "next/link";

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
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
        <div className="h-full flex flex-col items-center justify-between py-4">
            <div className="space-y-6 flex flex-col items-center">
                <Link href="/generate-resume" passHref>
                    <Button variant={pathname === "/generate-resume" ? "default" : "outline"} size="icon" className="w-6 h-6">
                        <PlusSquare className={pathname === "/generate-resume" ? "h-4 w-4 text-purple-500" : "h-4 w-4 text-gray-500"} />
                    </Button>
                </Link>
                <Link href="/profiles" passHref>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                        <Users className={pathname === "/profiles" ? "h-4 w-4 text-purple-500" : "h-4 w-4 text-gray-500"} />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                    <LayoutDashboard className="h-4 w-4 text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                    <FileText className="h-4 w-4 text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Settings className="h-4 w-4 text-gray-300" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500" onClick={handleLogout}>
                       .....
                </Button>
            </div>
            <Link href="/user-info" passHref>
                <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity mb-4 rounded-full">
                    {appState?.userType.personalInfo.profilePicture ? (
                        <AvatarImage
                            src={appState?.userType.personalInfo.profilePicture}
                            alt="User Profile"
                            className={`h-6 w-6 rounded-full mb-2 ${
                                appState?.userType.adminInfo.plan === 'pro' ? 'border-2 border-purple-500' :
                                        appState?.userType.adminInfo.plan === 'premium' ? 'border-2 border-pink-500' :
                                        'border-2 border-purple-500'
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
        </div>
    )
}

export default Sidebar; 