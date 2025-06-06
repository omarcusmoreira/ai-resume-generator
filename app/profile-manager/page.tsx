'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pencil, Check, X, Link as LinkIcon, Trash2, UserX } from 'lucide-react'
import ProfileWizardComponent from '@/components/ProfileCreationDialog'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ProfileSectionType, ProfileType } from '@/types/profiles'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'
import { useProfileStore } from '@/stores/profileStore'
import { useQuotaStore } from '@/stores/quotaStore'
import { useUserDataStore } from '@/stores/userDataStore'
import { ProfileNameInput } from '@/components/ProfileNameInput'

export default function ProfileManagement() {
  const router = useRouter()
  const [activeProfile, setActiveProfile] = useState<string>('')
  const [editingSection, setEditingSection] = useState<keyof ProfileSectionType | null>(null)
  const [localProfileChanges, setLocalProfileChanges] = useState<ProfileType | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isUpgradeAlertDialogOpen, setIsUpgradeAlertDialogOpen] = useState(false)

  const { userData } = useUserDataStore();
  const { profiles, updateProfile, deleteProfile  } = useProfileStore();
  const { quotas, increaseQuota } = useQuotaStore();

  console.log('Fetched Quotas: ', quotas)


  useEffect(()=>{
    const updateProfiles = ()=>{
      if (profiles.length > 0 && !activeProfile) {
        setActiveProfile(profiles[0].id);
      }
    }
    updateProfiles();
  }, [profiles, activeProfile])

  const ProfileSectionTitle: Record<keyof ProfileSectionType, string> = {
    keywords: "Palavras-chave",
    summary: "Resumo de Qualificações",
    professionalExperience: "Experiência Profissional",
    academicBackground: "Formação Acadêmica",
    idioms: "Idiomas",
    extraCurricular: "Atividades Complementares/Certificações"
  }

  const handleSectionChange = (profileId: string, sectionKey: keyof ProfileSectionType, content: string) => {
    setLocalProfileChanges(prev => {
      if (!prev) {
        const profile = profiles.find(p => p.id === profileId)!;
        return { ...profile, sections: { ...profile.sections, [sectionKey]: content } };
      }
      return { ...prev, sections: { ...prev.sections, [sectionKey]: content }};
    });
  };

  const saveProfileChanges = async () => {
    if (localProfileChanges) {
      const updatedProfile = {
        ...profiles.find(p => p.id === localProfileChanges.id)!,
        sections: {
          ...profiles.find(p => p.id === localProfileChanges.id)!.sections,
          ...localProfileChanges.sections
        }
      }
      await updateProfile(updatedProfile)
      setLocalProfileChanges(null)
      setEditingSection(null)
    }
  }

  const cancelProfileChanges = () => {
    setLocalProfileChanges(null)
    setEditingSection(null)
  }

  const handleAddProfile = () => {
    if (profiles.length < 5) {
      setIsWizardOpen(true)
    }
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
  }

  const handlePersonalInfoClick = () => {
    router.push('/user-info')
  }

  const handleDeleteProfile = async (profileId: string) => {
    await deleteProfile(profileId);
    await increaseQuota('profiles');
    if (profiles.length > 1) {
      const newActiveProfile = profiles.find(p => p.id !== profileId)?.id;
      if (newActiveProfile) {
        setActiveProfile(newActiveProfile);
      }
    }
  }

  const handleUpgradePlan = () => {
    setIsUpgradeAlertDialogOpen(true)
  }

  const handleCloseUpgradeDialog = () => {
    setIsUpgradeAlertDialogOpen(false)
  }

  if (!profiles){
    return(
      <div>carregando dados do usuário...</div>
    )
  }
  return (
    <div className="flex-1 p-2 md:p-8 overflow-auto flex items-center justify-center pb-20">
      <Card className="w-full max-w-3xl p-2 md:p-6">
    <div className="container mx-auto p-2 md:p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Meus Perfis</h1>
      { profiles.length === 0 ? (
        <div className="flex justify-center items-center flex-col">
          <UserX className='h-20 w-20 text-gray-300 mb-4'/>
          <p className="text-2xl text-gray-400 text-center">Voce ainda não tem nenhum perfil.</p>
          <p className="text-base text-gray-600 mb-4 text-center">Cadastre seu primeiro perfil para poder começar a criar seus currículos.</p>
          <Button onClick={quotas.profiles === 0 ? handleUpgradePlan : handleAddProfile} className='mt-4 mb-6'>
              <Plus className="h-4 w-4 md:mr-2" /> 
              <p className="hidden md:block">Perfil</p>
          </Button>
        </div>
      ) : (
      <Tabs value={activeProfile} onValueChange={setActiveProfile} className="w-full" >
        <div className="flex justify-between items-center mb-4">
          <TabsList className='flex-nowrap overflow-y-auto h-full'>
            {profiles.map((profile) => (
              <TabsTrigger key={profile.id} value={profile.id}>
                {profile.profileName}
              </TabsTrigger>
            ))}
          </TabsList>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={quotas.profiles === 0 ? handleUpgradePlan : handleAddProfile} className='ml-2'>
                  <Plus className="h-4 w-4 md:mr-2" /> 
                  <p className="hidden md:block">Perfil</p>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`Voce ainda tem ${quotas.profiles} perfis disponiveis`}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {profiles.map((profile) => (
          <TabsContent key={profile.id} value={profile.id} className="space-y-2">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className='flex justify-between'>
                <ProfileNameInput profile={profile} />
                  <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className='bg-white'>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deseja mesmo deletar o perfil?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Atenção! Esta ação não pode ser desfeita. 
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProfile(profile.id)} className='bg-red-600 hover:bg-red-700 text-white'>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <Avatar className="w-24 h-24 cursor-pointer" onClick={handlePersonalInfoClick}>
                    <AvatarImage src={userData?.personalInfo.profilePicture} alt={userData?.personalInfo.name} />
                    <AvatarFallback>{userData?.personalInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-grow space-y-2 cursor-pointer justify-start" onClick={handlePersonalInfoClick}>
                    <h2 className="text-2xl font-bold">{userData?.personalInfo.name}</h2>
                    <p className="text-sm text-muted-foreground">{userData?.personalInfo.phone} | {userData?.personalInfo.email}</p>
                    <p className="text-sm text-muted-foreground">{userData?.personalInfo.city}</p>
                    <p className="text-sm text-blue-600 flex items-center leading-tight">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {userData?.personalInfo.linkedinURL}
                    </p>
                  </div>
                </div>
                {Object.keys(ProfileSectionTitle).map((key) => {
                  const section = profile.sections[key as keyof ProfileSectionType];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-semibold">
                          {ProfileSectionTitle[key as keyof ProfileSectionType]}
                        </h3>
                        {editingSection !== key ? (
                          <Button variant="ghost" size="sm" onClick={() => setEditingSection(key as keyof ProfileSectionType)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={saveProfileChanges}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelProfileChanges}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingSection === key ? (
                        <Textarea
                          value={localProfileChanges?.sections[key as keyof ProfileSectionType] || section}
                          onChange={(e) => handleSectionChange(profile.id, key as keyof ProfileSectionType, e.target.value)}
                          onBlur={saveProfileChanges}
                          rows={5}
                          className="w-full"
                        />
                      ) : (
                        <p className="whitespace-pre-line">{section}</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
          )
        )}
      </Tabs>
      )}
    </div>
    </Card>
    <ProfileWizardComponent 
      isOpen={isWizardOpen} 
      onClose={handleCloseWizard}
    />
    <UpgradeDialog 
      title='Perfis'
      isOpen={isUpgradeAlertDialogOpen}
      onClose={handleCloseUpgradeDialog}
    />
    </div>
  )
}
