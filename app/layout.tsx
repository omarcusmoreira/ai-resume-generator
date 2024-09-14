'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { History, FileText, User, Sparkles } from "lucide-react"
import "./globals.css"
import { useAppState } from '@/hooks/useAppState'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [appState] = useAppState()

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-md">
            <div className="flex flex-col h-full">
              <div className="p-4 flex flex-col items-center">
                <Link href="/profile-page" passHref>
                  <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity mb-2">
                    {appState.personalInfo.picture ? (
                      <AvatarImage src={appState.personalInfo.picture} alt="User Profile" />
                    ) : (
                      <AvatarFallback>{appState.personalInfo.name ? appState.personalInfo.name[0].toUpperCase() : 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                <span className="text-sm font-medium">{appState.personalInfo.name || 'User'}</span>
              </div>
              <nav className="flex-1 p-4">
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
                  <History className="mr-2 h-4 w-4" />
                  Processos Seletivos
                </Button>
                <Button variant="ghost" className="w-full justify-start text-button">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerenciar Currículos
                </Button>
              </nav>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
