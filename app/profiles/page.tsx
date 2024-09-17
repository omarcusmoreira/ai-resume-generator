"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusSquare, Copy, Sparkles, RefreshCw } from "lucide-react"
import { useFirestore } from "@/hooks/useFirestore"
import { ProfileSectionType, ProfileType } from "@/types"

const resumeSections: (keyof ProfileSectionType)[] = [
  "summary",
  "professionalExperience",
  "academicBackground",
  "idioms",
  "extraCurricular"
];

const profileSections = {
  summary: { placeholder: "Enter your qualification summary" },
  professionalExperience: { placeholder: "Enter your professional experience" },
  academicBackground: { placeholder: "Enter your academic background" },
  idioms: { placeholder: "Enter your idioms" },
  extraCurricular: { placeholder: "Enter your extracurricular activities and certifications" }
};

export default function ProfilePage() {
  const { appState, addProfile, updateProfile } = useFirestore()
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [enhancedTexts, setEnhancedTexts] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (appState?.profiles.length) {
      setActiveProfileId(appState.profiles[0].id)
    } else {
      setActiveProfileId(null)
    }
  }, [appState])

  const handleAddProfile = async () => {
    const newProfile: ProfileType = {
      id: `profile_${Date.now()}`,
      profileName: `Profile ${appState?.profiles.length ? appState.profiles.length + 1 : 1}`,
      sections: resumeSections.reduce((acc, section) => {
        acc[section] = { content: "", aiEnhanced: "" }
        return acc
      }, {} as ProfileSectionType)
    }
    await addProfile(newProfile)
    setActiveProfileId(newProfile.id)
  }

  const handleContentChange = async (profileId: string, sectionKey: keyof ProfileSectionType, content: string) => {
    const profile = appState?.profiles.find(p => p.id === profileId)
    if (!profile) return

    const updatedSections = {
      ...profile.sections,
      [sectionKey]: {
        content,
        aiEnhanced: `AI enhanced: ${content}`
      }
    }

    const updatedProfile: ProfileType = { ...profile, sections: updatedSections }
    await updateProfile(updatedProfile)
  }

  const handleEnhance = (sectionKey: keyof ProfileSectionType) => {
    setEnhancedTexts(prev => ({
      ...prev,
      [sectionKey]: `Enhanced ${sectionKey} text goes here. This is a placeholder for the AI-generated content.`
    }))
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // Optionally add a toast notification here
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <Tabs value={activeProfileId || ''} onValueChange={setActiveProfileId} className="w-full">
        <TabsList>
          {appState?.profiles.map(profile => (
            <TabsTrigger key={profile.id} value={profile.id}>
              <span className="cursor-pointer">{profile.profileName}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <Button variant="outline" size="sm" onClick={handleAddProfile}>
          <PlusSquare className="h-4 w-4 mr-2" />
          Add Profile
        </Button>
        {appState?.profiles.map(profile => (
          <TabsContent key={profile.id} value={profile.id} className="mt-0">
            <Card className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {profile.sections && (
                    <>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-semibold">Qualification Summary</h2>
                          <Button onClick={() => handleEnhance("summary")} variant="ai" size="sm">
                            {enhancedTexts["summary"] ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Enhance
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          className="mb-2"
                          placeholder={profileSections.summary.placeholder}
                          value={profile.sections.summary?.content || ""}
                          onChange={(e) => handleContentChange(profile.id, "summary", e.target.value)}
                        />
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-semibold">Professional Experience</h2>
                          <Button onClick={() => handleEnhance("professionalExperience")} variant="ai" size="sm">
                            {enhancedTexts["professionalExperience"] ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Enhance
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          className="mb-2"
                          placeholder={profileSections.professionalExperience.placeholder}
                          value={profile.sections.professionalExperience?.content || ""}
                          onChange={(e) => handleContentChange(profile.id, "professionalExperience", e.target.value)}
                        />
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-semibold">Academic Background</h2>
                          <Button onClick={() => handleEnhance("academicBackground")} variant="ai" size="sm">
                            {enhancedTexts["academicBackground"] ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Enhance
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          className="mb-2"
                          placeholder={profileSections.academicBackground.placeholder}
                          value={profile.sections.academicBackground?.content || ""}
                          onChange={(e) => handleContentChange(profile.id, "academicBackground", e.target.value)}
                        />
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-semibold">Idioms</h2>
                          <Button onClick={() => handleEnhance("idioms")} variant="ai" size="sm">
                            {enhancedTexts["idioms"] ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Enhance
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          className="mb-2"
                          placeholder={profileSections.idioms.placeholder}
                          value={profile.sections.idioms?.content || ""}
                          onChange={(e) => handleContentChange(profile.id, "idioms", e.target.value)}
                        />
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-semibold">Extracurricular/Certifications</h2>
                          <Button onClick={() => handleEnhance("extraCurricular")} variant="ai" size="sm">
                            {enhancedTexts["extraCurricular"] ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Enhance
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          className="mb-2"
                          placeholder={profileSections.extraCurricular.placeholder}
                          value={profile.sections.extraCurricular?.content || ""}
                          onChange={(e) => handleContentChange(profile.id, "extraCurricular", e.target.value)}
                        />
                      </Card>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  {Object.keys(enhancedTexts).length === 0 ? (
                    <>
                      <CardSkeleton />
                      <CardSkeleton />
                      <CardSkeleton />
                    </>
                  ) : (
                    Object.entries(enhancedTexts).map(([section, text]) => (
                      <Card key={section} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-lg font-semibold">Enhanced {section}</h2>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(text)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{text}</p>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// Skeleton Component for Loading State
const CardSkeleton = () => (
  <Card className="p-4">
    <div className="flex justify-between items-center mb-2">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full mt-4" />
    <Skeleton className="h-4 w-5/6 mt-2" />
    <Skeleton className="h-4 w-4/6 mt-2" />
  </Card>
)