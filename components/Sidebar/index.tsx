import { Files, LayoutDashboard, PlusSquare, Settings, Users } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import UserMenu from "../UserMenu";
import Image from "next/image";
import logo from '../../public/assets/images/logo_quadrado.ico'

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="h-full flex flex-col items-center justify-between py-4" >
            <div className="space-y-6 flex flex-col items-center">
                <Image src={logo} alt="Logo" width={20} height={20} />
                <Link href="/job-tracker" passHref>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                    <LayoutDashboard className={pathname === "/job-tracker" ? "h-4 w-4 text-purple-600" : "h-4 w-4 text-gray-500"} />
                </Button>
                </Link>
                <Link href="/resume-generate" passHref>
                    <Button variant="ghost" size="icon" className="w-6 h-6">
                        <PlusSquare className={pathname === "/resume-generate" ? "h-4 w-4 text-purple-600" : "h-4 w-4 text-gray-500"} />
                    </Button>
                </Link>
                <Link href="/profile-manager" passHref>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Users className={pathname === "/profile-manager" ? "h-4 w-4 text-purple-600" : "h-4 w-4 text-gray-500"} />
                </Button>
                </Link>
                <Link href="/resume-manager" passHref>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Files className={pathname === "/resume-manager" ? "h-4 w-4 text-purple-600" : "h-4 w-4 text-gray-500"} />
                </Button>
                </Link>
                <Link href="/user-info" passHref>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Settings className={pathname === "/user-info" ? "h-4 w-4 text-purple-600" : "h-4 w-4 text-gray-500"} />
                </Button>
                </Link>
            </div>
            <UserMenu />

        </div>
    )
}

export default Sidebar; 