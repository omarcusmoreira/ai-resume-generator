import { FileText, LayoutDashboard, PlusSquare, Settings, Users } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import UserMenu from "../UserMenu/page";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import Image from "next/image";
import logo from '../../public/assets/images/logo_quadrado.ico'

const Sidebar = () => {
    const pathname = usePathname();
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
        <div className="h-full flex flex-col items-center justify-between py-4" >
            <div className="space-y-6 flex flex-col items-center">
                <Image src={logo} alt="Logo" width={20} height={20} />
                <Link href="/generate-resume" passHref>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
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
            <UserMenu />

        </div>
    )
}

export default Sidebar; 