'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pencil, Check, X, Link as LinkIcon, Trash2, UserX } from 'lucide-react'
import ProfileWizardComponent from '@/components/ProfileCreationDialog'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { PersonalInfoType } from '@/types/users'
import { ProfileSectionType, ProfileType } from '@/types/profiles'
import { getUserData } from '@/services/userServices'
import { deleteProfile, getProfiles, updateProfile } from '@/services/profileServices'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getQuotas, incrementQuota } from '@/services/quotaServices'
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'

export default function ProfileManagement() {
  const router = useRouter()
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoType | null>(null)
  const [profiles, setProfiles] = useState<ProfileType[]>([])
  const [activeProfile, setActiveProfile] = useState<string>('')
  const [editingSection, setEditingSection] = useState<keyof ProfileSectionType | null>(null)
  const [localProfileChanges, setLocalProfileChanges] = useState<ProfileType | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [quota, setQuota] = useState(0)
  const [isUpgradeAlertDialogOpen, setIsUpgradeAlertDialogOpen] = useState(false)

  const ProfileSectionTitle: Record<keyof ProfileSectionType, string> = {
    keywords: "Keywords",
    summary: "Resumo de Qualificações",
    professionalExperience: "Experiência Profissional",
    academicBackground: "Formação Acadêmica",
    idioms: "Idiomas",
    extraCurricular: "Atividades Complementares/Certificações"
  }
  const fetchData = async () => { 
    const fetchedUser = await getUserData()
    const fetchedProfiles = await getProfiles()
    const fetchedQuotas = await getQuotas()

    setPersonalInfo(fetchedUser?.personalInfo || null)
    setProfiles(fetchedProfiles)
    setQuota(fetchedQuotas.profiles)

    if (fetchedProfiles.length > 0) {
      setActiveProfile(fetchedProfiles[0].id)
    }
  }
  const [refreshKey, setRefreshKey] = useState(0)
  useEffect(() => {
    fetchData()
  }, [refreshKey]);

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
      setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p))
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
    setTimeout(() => setRefreshKey(prevKey => prevKey + 1), 500)
  }

  const handlePersonalInfoClick = () => {
    router.push('/user-info')
  }

  const handleDeleteProfile = async (profileId: string) => {
    await deleteProfile(profileId);
    await incrementQuota('profiles');
    if (profiles.length > 1) {
      const newActiveProfile = profiles.find(p => p.id !== profileId)?.id;
      if (newActiveProfile) {
        setActiveProfile(newActiveProfile);
      }
    }
    setRefreshKey(prevKey => prevKey + 1)
  }

  const handleUpgradePlan = () => {
    setIsUpgradeAlertDialogOpen(true)
  }

  const handleCloseUpgradeDialog = () => {
    setIsUpgradeAlertDialogOpen(false)
  }

  if (!personalInfo) {
    return <div>Loading profiles...</div>
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
      <Card className="w-full max-w-3xl p-4 md:p-6">
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Meus Perfis</h1>
      { profiles.length === 0 ? (
        <div className="flex justify-center items-center flex-col">
          <UserX className='h-20 w-20 text-gray-300 mb-4'/>
          <p className="text-2xl text-gray-400">Voce ainda não tem nenhum perfil.</p>
          <p className="text-base text-gray-600 mb-4">Cadastre seu primeiro perfil para poder começar a criar seus currículos.</p>
          <Button onClick={quota === 0 ? handleUpgradePlan : handleAddProfile} className='mt-4 mb-6'>
              <Plus className="h-4 w-4 md:mr-2" /> 
              <p className="hidden md:block">Perfil</p>
          </Button>
        </div>
      ) : (
      <Tabs value={activeProfile} onValueChange={setActiveProfile} className="w-full" key={refreshKey}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            {profiles.map((profile) => (
              <TabsTrigger key={profile.id} value={profile.id}>
                {profile.profileName}
              </TabsTrigger>
            ))}
          </TabsList>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={quota === 0 ? handleUpgradePlan : handleAddProfile} className='ml-2'>
                  <Plus className="h-4 w-4 md:mr-2" /> 
                  <p className="hidden md:block">Perfil</p>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{`Voce ainda tem ${quota} perfis disponiveis`}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {profiles.map((profile) => (
          <TabsContent key={profile.id} value={profile.id} className="space-y-6">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className='flex justify-between'>
                  <Input
                    value={profile.profileName}
                    onChange={(e) => {
                      const updatedProfiles = profiles.map(p =>
                        p.id === profile.id ? { ...p, profileName: e.target.value } : p
                      );
                      setProfiles(updatedProfiles);
                    }}
                    onBlur={async () => {
                      await updateProfile(profile);
                    }}
                    className="text-2xl font-bold bg-transparent border-none hover:bg-gray-100 focus:bg-white"
                    aria-label="Profile name"
                  />
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
                    <AvatarImage src={personalInfo.profilePicture} alt={personalInfo.name} />
                    <AvatarFallback>{personalInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-grow space-y-2 cursor-pointer justify-start" onClick={handlePersonalInfoClick}>
                    <h2 className="text-2xl font-bold">{personalInfo.name}</h2>
                    <p className="text-sm text-muted-foreground">{personalInfo.phone} | {personalInfo.email}</p>
                    <p className="text-sm text-muted-foreground">{personalInfo.city}</p>
                    <p className="text-sm text-blue-600 flex items-center leading-tight">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {personalInfo.linkedinURL}
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
        ))}
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
