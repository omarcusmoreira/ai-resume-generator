'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pencil, Check, X, Link as LinkIcon, Trash2 } from 'lucide-react'
import { PersonalInfoType, ProfileSectionType, ProfileType } from '@/types'
import { useFirestore } from '@/hooks/useFirestore'
import ProfileWizardComponent from '@/components/profile-wizard/profile-wizard'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const ProfileSectionTitle: Record<keyof ProfileSectionType, string> = {
  keywords: "Keywords",
  summary: "Resumo de Qualificações",
  professionalExperience: "Experiência Profissional",
  academicBackground: "Formação Acadêmica",
  idioms: "Idiomas",
  extraCurricular: "Atividades Complementares/Certificações"
}

export default function ProfileManagement() {
  const router = useRouter()
  const { appState, updateProfile, deleteProfile } = useFirestore()
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoType | null>(null)
  const [profiles, setProfiles] = useState<ProfileType[]>([])
  const [activeProfile, setActiveProfile] = useState<string>('')
  const [editingSection, setEditingSection] = useState<keyof ProfileSectionType | null>(null)
  const [localProfileChanges, setLocalProfileChanges] = useState<ProfileType | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  useEffect(() => {
    if (appState) {
      setPersonalInfo(appState.userType.personalInfo)
      setProfiles(appState.profiles)
      if (appState.profiles.length > 0) {
        setActiveProfile(appState.profiles[0].id)
      }
    }
  }, [appState])

  const handleSectionChange = (profileId: string, sectionKey: keyof ProfileSectionType, content: string) => {
    setLocalProfileChanges(prev => {
      if (!prev) {
        const profile = profiles.find(p => p.id === profileId)!;
        return { ...profile, sections: { ...profile.sections, [sectionKey]: { ...profile.sections[sectionKey], content } } };
      }
      return { ...prev, sections: { ...prev.sections, [sectionKey]: { ...prev.sections[sectionKey], content } } };
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

  const addKeyword = async (profileId: string, keyword: string) => {
    const updatedProfile = profiles.map(profile => 
      profile.id === profileId
        ? { 
            ...profile, 
            sections: { 
              ...profile.sections, 
              keywords: { 
                ...profile.sections.keywords, 
                content: profile.sections.keywords.content + (profile.sections.keywords.content ? ", " : "") + keyword
              } 
            } 
          }
        : profile
    )
    setProfiles(updatedProfile)
    await updateProfile(updatedProfile.find(profile => profile.id === profileId)!)
  }

  const removeKeyword = async (profileId: string, keywordToRemove: string) => {
    const updatedProfile = profiles.map(profile => 
      profile.id === profileId
        ? { 
            ...profile, 
            sections: { 
              ...profile.sections, 
              keywords: { 
                ...profile.sections.keywords, 
                content: profile.sections.keywords.content
                  .split(', ')
                  .filter(keyword => keyword !== keywordToRemove)
                  .join(', ')
              } 
            } 
          }
        : profile
    )
    setProfiles(updatedProfile)
    await updateProfile(updatedProfile.find(profile => profile.id === profileId)!)
  }

  const handleAddProfile = () => {
    if (profiles.length < 5) {
      setIsWizardOpen(true)
    }
  }

  const handlePersonalInfoClick = () => {
    router.push('/user-info')
  }

  const handleDeleteProfile = async (profileId: string) => {
    await deleteProfile(profileId);
    if (profiles.length > 1) {
      const newActiveProfile = profiles.find(p => p.id !== profileId)?.id;
      if (newActiveProfile) {
        setActiveProfile(newActiveProfile);
      }
    }
  }

  if (!personalInfo || profiles.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
      <Card className="w-full max-w-3xl p-4 md:p-6">
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Profile Management</h1>
      <Tabs value={activeProfile} onValueChange={setActiveProfile} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            {profiles.map((profile) => (
              <TabsTrigger key={profile.id} value={profile.id}>
                {profile.profileName}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button onClick={handleAddProfile} disabled={profiles.length >= 5}>
            <Plus className="h-4 w-4 md:mr-2" /> 
            <p className="hidden md:block">Perfil</p>
          </Button>
        </div>
        {profiles.map((profile) => (
          <TabsContent key={profile.id} value={profile.id} className="space-y-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 py-1 px-6 transform rotate-45 translate-x-[30%] translate-y-[30%] text-sm font-semibold">
                RASCUNHO
              </div>
              <CardHeader>
                <CardTitle>
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
                          value={localProfileChanges?.sections[key as keyof ProfileSectionType]?.content || section.content}
                          onChange={(e) => handleSectionChange(profile.id, key as keyof ProfileSectionType, e.target.value)}
                          onBlur={saveProfileChanges}
                          rows={5}
                          className="w-full"
                        />
                      ) : (
                        <p className="whitespace-pre-line">{section.content}</p>
                      )}
                      {section.aiEnhanced && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="text-sm text-blue-800">AI Enhanced: {section.aiEnhanced}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.sections.keywords.content.split(', ').filter(Boolean).map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-sm">
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0"
                          onClick={() => removeKeyword(profile.id, keyword)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" /> Add Keyword
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white">
                        <DialogHeader>
                          <DialogTitle>Add Keyword</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Input
                            placeholder="Enter keyword"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addKeyword(profile.id, (e.target as HTMLInputElement).value)
                                ;(e.target as HTMLInputElement).value = ''
                              }
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-4 right-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Atenção, ao deletar um perfil todos os currículos atrelados a ele serão perdidos. Deseja continuar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProfile(profile.id)}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
    </Card>
    <ProfileWizardComponent 
      isOpen={isWizardOpen} 
      onClose={() => setIsWizardOpen(false)}
    />
    </div>
  )
}
