import { FileText, LayoutDashboard, PlusSquare, Settings, Users } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useFirestore } from "@/hooks/useFirestore";
import Link from "next/link";
import UserMenu from "../UserMenu/page";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const Sidebar = () => {
    const pathname = usePathname();
    const { loading, error, appState } = useFirestore();
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

    if (loading) {
        return <div className="w-64 bg-white shadow-md">Loading...</div>;
    }

    if (error) {
        return <div className="w-64 bg-white shadow-md">Error: {error}</div>;
    }

    return (
        <div className="h-full flex flex-col items-center justify-between py-4" >
            <div className="space-y-6 flex flex-col items-center">
                <Link href="/generate-resume" passHref>
                    <Button variant={pathname === "/generate-resume" ? "default" : "outline"} size="icon" className="w-6 h-6">
                        <PlusSquare className={pathname === "/generate-resume" ? "h-4 w-4 text-purple-500" : "h-4 w-4 text-gray-500"} />
                    </Button>
                </Link>
                <Link href="/profile-manager" passHref>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                        <Users className={pathname === "/profile-manager" ? "h-4 w-4 text-purple-500" : "h-4 w-4 text-gray-500"} />
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
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleLogout}>
                    <p className="text-gray-300">.....</p>
                </Button>
            </div>
            <UserMenu profilePicture={appState?.userType.personalInfo.profilePicture} userName={appState?.userType.personalInfo.name} plan={appState?.userType.adminInfo.plan} />
        </div>
    )
}

export default Sidebar; 