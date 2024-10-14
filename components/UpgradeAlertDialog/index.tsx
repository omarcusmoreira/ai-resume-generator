"use client"

import { Zap, FileText, Users, Crown, Handshake, Building2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UpgradeDialogProps {
  title: "Perfis" | "Currículos" | "Interações" | "Vagas" | "Contatos"
  isOpen: boolean
  onClose: () => void
}

const iconMap = {
  Perfis: Users,
  Currículos: FileText,
  Interações: Zap,
  Vagas: Handshake,
  Contatos: Building2
}

export function UpgradeDialog({ title, isOpen, onClose }: UpgradeDialogProps) {
  const Icon = iconMap[title]

  const handleUpgrade = () => {
    console.log('Ainda estamos trabalhando nisso...')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-r from-purple-500 to-pink-500 border-none text-white shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <Crown className="h-8 w-8 text-yellow-300" />
              Limite atingido
            </DialogTitle>
            <DialogDescription className="text-white">
              <p className="text-lg font-semibold mb-4">
                Faça o Upgrade da conta para ter mais {title}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <Icon className="h-8 w-8 flex-shrink-0" />
                <span className="text-sm">
                  Aumente seu limite de {title.toLowerCase()} e aproveite mais recursos.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-transparent text-white border-white hover:bg-white hover:text-purple-700 transition-colors"
            >
              Agora não
            </Button>
            <Link href='/upgrade-page'>
              <Button
                onClick={handleUpgrade}
                className="bg-white text-purple-700 hover:bg-purple-100 hover:text-purple-800 transition-colors font-semibold"
                >
                Fazer upgrade
              </Button>
            </Link>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}