'use client'

import { useState, useEffect } from 'react'
import { ClipboardCopy, Trash2, Plus, Wand2, RefreshCw, Save, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirestore } from '@/hooks/useFirestore'
import { ProfileType, ProfileSectionType } from '@/types'
import ProfileWizardComponent from '@/components/profile-wizard/profile-wizard'
import { toast } from "@/hooks/use-toast"
import { deleteProfile } from '@/services/firestoreService'

const sectionTitles: Record<keyof ProfileSectionType, string> = {
  keywords: 'Keywords',
  summary: 'Summary',
  professionalExperience: 'Professional Experience',
  academicBackground: 'Academic Background',
  idioms: 'Idioms',
  extraCurricular: 'ExtraCurricular'
}

export default function ProfileManagement() {
  const { appState, loading, error, updateProfile } = useFirestore()
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [localProfileData, setLocalProfileData] = useState<Record<string, ProfileType>>({})
  const [enhancingSection, setEnhancingSection] = useState<string | null>(null)

  useEffect(() => {
    if (appState?.profiles && appState?.profiles.length > 0 && !activeProfileId) {
      setActiveProfileId(appState.profiles[0].id)
    }
    if (appState?.profiles) {
      const initialLocalData = appState.profiles.reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {} as Record<string, ProfileType>)
      setLocalProfileData(initialLocalData)
    }
  }, [appState, activeProfileId])

  const handleAddProfile = () => {
    if (appState?.profiles && appState?.profiles.length >= 5) {
      toast({
        title: "Profile limit reached",
        description: "You can't create more than 5 profiles.",
        variant: "destructive",
      })
      return
    }
    setIsWizardOpen(true)
  }

  const handleDeleteProfile = (id: string) => {
    console.log('Deleting profile:', id);
    deleteProfile(id)
    if (activeProfileId === id) {
      setActiveProfileId(appState?.profiles?.[0]?.id || null)
    }
  }

  const handleUpdateProfile = async (updatedProfile: ProfileType) => {
    try {
      await updateProfile(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
    }
  };

  const enhanceContent = async (profileId: string, sectionKey: keyof ProfileSectionType) => {
    setEnhancingSection(`${profileId}-${sectionKey}`)
    try {
      // Simulating AI enhancement
      await new Promise(resolve => setTimeout(resolve, 1000))
      const profile = localProfileData[profileId]
      if (profile) {
        const enhancedContent = `Enhanced ${profile.sections?.[sectionKey]?.content || ''}`
        const updatedProfile = {
          ...profile,
          sections: {
            ...profile.sections,
            [sectionKey]: {
              ...profile.sections?.[sectionKey],
              aiEnhanced: enhancedContent
            }
          }
        }
        await handleUpdateProfile(updatedProfile)
      }
    } finally {
      setEnhancingSection(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSaveSection = async (profileId: string, sectionKey: keyof ProfileSectionType) => {
    const updatedProfile = localProfileData[profileId]
    try {
      await updateProfile(updatedProfile)
      toast({
        title: "Saved",
        description: `${sectionTitles[sectionKey]} has been updated.`,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
      <Card className="w-full max-w-3xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de perfis</h1>
          <Button onClick={handleAddProfile} disabled={!!appState?.profiles && appState?.profiles.length >= 5}>
            <Plus className="mr-2 h-4 w-4" /> Perfil
          </Button>
        </div>
        {appState?.profiles && appState?.profiles.length > 0 ? (
          <Tabs value={activeProfileId || undefined} onValueChange={(value) => setActiveProfileId(value)} className="w-full">
            <TabsList className="mb-4 w-full">
              {appState?.profiles.map(profile => (
                <TabsTrigger key={profile.id} value={profile.id}>{profile.profileName}</TabsTrigger>
              ))}
            </TabsList>
              {appState?.profiles.map(profile => (
              <TabsContent key={profile.id} value={profile.id}>
                <Card>
                <CardHeader className="flex flex-col space-y-4 pb-2 mb-6">
                <div className="flex items-center justify-between">
                      <Input
                        value={localProfileData[profile.id]?.profileName || ''}
                        onChange={(e) => setLocalProfileData(prev => ({
                          ...prev,
                          [profile.id]: {
                            ...prev[profile.id],
                            profileName: e.target.value
                            }
                          }))}
                        className="text-2xl font-bold bg-transparent border-none hover:bg-gray-100 focus:bg-white"
                        aria-label="Profile name"
                      />
                      <div className="flex space-x-2">
                        <Button variant="ghost" onClick={() => handleSaveSection(profile.id, 'summary')} aria-label="Save profile">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => handleDeleteProfile(profile.id)} aria-label="Delete profile">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-full">
                  <Input
                    value={localProfileData[profile.id]?.sections?.keywords?.content || ''}
                    onChange={(e) => setLocalProfileData(prev => ({
                      ...prev,
                      [profile.id]: {
                        ...prev[profile.id],
                        sections: {
                          ...prev[profile.id].sections,
                          keywords: { ...prev[profile.id].sections?.keywords, content: e.target.value }
                        }
                      }
                    }))}
                    placeholder="Enter keywords (e.g., React, JavaScript, CSS)"
                    className="w-full"
                    aria-label="Profile keywords"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(Object.keys(sectionTitles) as Array<keyof ProfileSectionType>).filter(key => key !== 'keywords').map(sectionKey => (
                        <div key={sectionKey} className="grid md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="py-2">
                              <CardTitle className="text-sm font-semibold">{sectionTitles[sectionKey]}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2">
                              <Textarea
                                value={localProfileData[profile.id]?.sections?.[sectionKey]?.content || ''}
                                onChange={(e) => setLocalProfileData(prev => ({
                                  ...prev,
                                  [profile.id]: {
                                    ...prev[profile.id],
                                    sections: {
                                      ...prev[profile.id].sections,
                                      [sectionKey]: { ...prev[profile.id].sections?.[sectionKey], content: e.target.value }
                                    }
                                  }
                                }))}
                                placeholder={`Enter ${sectionTitles[sectionKey]}`}
                                className="w-full"
                                aria-label={`${sectionTitles[sectionKey]} content`}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant={profile.sections?.[sectionKey]?.aiEnhanced ? "secondary" : "ai"} 
                                  onClick={() => enhanceContent(profile.id, sectionKey)}
                                  disabled={enhancingSection === `${profile.id}-${sectionKey}`}
                                >
                                  {enhancingSection === `${profile.id}-${sectionKey}` ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : profile.sections?.[sectionKey]?.aiEnhanced ? (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                  ) : (
                                    <Wand2 className="mr-2 h-4 w-4" />
                                  )}
                                  {enhancingSection === `${profile.id}-${sectionKey}` ? 'Aprimorando...' : 
                                    profile.sections?.[sectionKey]?.aiEnhanced ? 'Atualizar' : 'Aprimorar'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="flex flex-col">
                            <CardHeader className="py-2">
                              <CardTitle className="text-sm text-foreground-muted font-semibold">{sectionTitles[sectionKey]} (Enhanced)</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                              {profile.sections?.[sectionKey]?.aiEnhanced ? (
                                <pre className="whitespace-pre-wrap text-sm h-full">{profile.sections[sectionKey].aiEnhanced}</pre>
                              ) : (
                                <Skeleton className="w-full h-[100px]" />
                              )}
                            </CardContent>
                            <CardFooter className="flex justify-end p-2">
                              {profile.sections?.[sectionKey]?.aiEnhanced && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(profile.sections[sectionKey].aiEnhanced)}
                                  aria-label={`Copy enhanced ${sectionTitles[sectionKey]}`}
                                >
                                  <ClipboardCopy className="h-4 w-4" />
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center">
            <p>No profiles found. Create a new profile to get started.</p>
          </div>
        )}
      </Card>
      <ProfileWizardComponent 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  )
}