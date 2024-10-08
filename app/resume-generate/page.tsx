'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { PlusSquare, Settings } from "lucide-react"
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserDataStore } from '@/stores/userDataStore'
import { useProfileStore } from '@/stores/profileStore'
import { useQuotaStore } from '@/stores/quotaStore'
import ProfileCreationDialogComponent from '@/components/ProfileCreationDialog'
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'
import { GenerateATSResumeCard } from './components/GenerateAtsResumeCard'
import { GenerateResumeWithJobDescriptionCard } from './components/GenerateResumeWithJobDescription Card'
import { GenerateCoverLetterCard } from './components/GenerateCoverLetterCard'
import { GenerateLinkedInBioCard } from './components/GenerateLinkedinBioCard'
import Link from 'next/link'


export default function GenerateResumePage() {
  const { userData } = useUserDataStore();
  const { profiles } = useProfileStore();
  const { quotas } = useQuotaStore();

  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string>()
  const [refreshKey, setRefreshKey] = useState(0)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const handleProfileCreationDialogClose = () => {
    setTimeout(() => setRefreshKey(prevKey => prevKey + 1), 500);
    setIsProfileWizardOpen(false);
  }

 
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-2 md:p-8 overflow-auto flex items-center justify-center mb-20">
        <Card className="w-full max-w-3xl p-4 md:p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Olá, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">{userData?.personalInfo.name || 'Usuário'}</span></h1>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Vamos criar seu currículo?</h2>
          <p className="text-gray-500 mb-6 md:mb-8">Selecione o perfil desejado, escolha um dos prompts abaixo e, caso deseje, forneça a descrição do cargo para criar seu currículo.</p>

          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Select 
                  key={refreshKey}
                  onValueChange={(value) => setSelectedProfile(value)}
                  disabled={profiles.length === 0}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder={profiles.length === 0 ? "Crie seu primeiro perfil" : "Escolha um perfil"}/>
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((profile, index) => (
                      profile.id ? (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.profileName || `Profile ${index + 1}`}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>         
                <Button 
                  variant="outline" 
                  className="ml-4"
                  onClick={() => setIsProfileWizardOpen(true)}
                  disabled={quotas?.profiles === 0}
                  >
                  <PlusSquare className="md:mr-2 h-4 w-4" />
                  <span className="hidden md:block">Perfil</span>
                </Button>
              </div>
              <div className="flex items-center ml-4">
                {/* <span className="text-sm font-medium w-full mr-2 text-gray-500">Modo Avançado</span>
                <Switch
                  disabled={true}
                  checked={isAdvanced}
                  onCheckedChange={handleToggleAdvanced}
                  className="mr-2"
                /> */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
            <GenerateResumeWithJobDescriptionCard selectedProfile={selectedProfile} isAdvanced={false}/>
            <GenerateCoverLetterCard selectedProfile={selectedProfile} />
            <GenerateATSResumeCard selectedProfile={selectedProfile} isAdvanced={false}/>
            <GenerateLinkedInBioCard selectedProfile={selectedProfile}/>
          </div>
          <Link href='/user-info' className='flex flex-row justify-center items-center'>
            <Settings className='h=4 w-4 mr-2 text-gray-500'/>
            <p className="text-gray-500 text-[0.7rem]">Atualize seus Dados Pessoais e visualize suas cotas <span className='text-purple-800'>clicando aqui.</span></p>
          </Link>
        </Card>
      </div>
      <ProfileCreationDialogComponent 
        isOpen={isProfileWizardOpen} 
        onClose={handleProfileCreationDialogClose}
      />
      <UpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        title={'Currículos'}
      />
    </div>
  )
}