'use client'

import { useState } from 'react'
import { ClipboardCopy, Trash2, Plus, Wand2, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Section = 'qualificationSummary' | 'professionalExperience' | 'academicBackground' | 'idioms' | 'extraCurricular'

interface Profile {
  id: string
  name: string
  keywords: string
  sections: Record<Section, { original: string; enhanced: string }>
}

const sectionTitles: Record<Section, string> = {
  qualificationSummary: 'Qualification Summary',
  professionalExperience: 'Professional Experience',
  academicBackground: 'Academic Background',
  idioms: 'Idioms',
  extraCurricular: 'ExtraCurricular'
}

const initialProfiles: Profile[] = [
  {
    id: '1',
    name: 'Frontend Developer',
    keywords: 'React, JavaScript, CSS, HTML',
    sections: {
      qualificationSummary: { original: 'Frontend developer with 5 years of experience', enhanced: '' },
      professionalExperience: { original: 'Worked at Tech Co. for 3 years', enhanced: '' },
      academicBackground: { original: 'BS in Computer Science', enhanced: '' },
      idioms: { original: 'English (fluent), Spanish (intermediate)', enhanced: '' },
      extraCurricular: { original: 'Open source contributor', enhanced: '' }
    }
  },
  {
    id: '2',
    name: 'Backend Developer',
    keywords: 'Node.js, Express, MongoDB, SQL',
    sections: {
      qualificationSummary: { original: 'Backend developer specializing in Node.js', enhanced: '' },
      professionalExperience: { original: 'Senior Backend Developer at Data Systems Inc.', enhanced: '' },
      academicBackground: { original: 'MS in Software Engineering', enhanced: '' },
      idioms: { original: 'English (native), German (basic)', enhanced: '' },
      extraCurricular: { original: 'Tech meetup organizer', enhanced: '' }
    }
  },
  {
    id: '3',
    name: 'Full Stack Developer',
    keywords: 'MERN stack, TypeScript, Docker',
    sections: {
      qualificationSummary: { original: 'Full stack developer with MERN expertise', enhanced: '' },
      professionalExperience: { original: 'Lead Developer at StartUp XYZ', enhanced: '' },
      academicBackground: { original: 'BS in Information Technology', enhanced: '' },
      idioms: { original: 'English (fluent), French (conversational)', enhanced: '' },
      extraCurricular: { original: 'Tech blogger', enhanced: '' }
    }
  },
  {
    id: '4',
    name: 'UX Designer',
    keywords: 'Figma, Adobe XD, User Research, Prototyping',
    sections: {
      qualificationSummary: { original: 'UX designer focused on user-centered design', enhanced: '' },
      professionalExperience: { original: 'Senior UX Designer at Design Studio', enhanced: '' },
      academicBackground: { original: 'BFA in Graphic Design', enhanced: '' },
      idioms: { original: 'English (native), Japanese (basic)', enhanced: '' },
      extraCurricular: { original: 'UX workshop facilitator', enhanced: '' }
    }
  },
  {
    id: '5',
    name: 'Data Scientist',
    keywords: 'Python, R, Machine Learning, Big Data',
    sections: {
      qualificationSummary: { original: 'Data scientist with ML and AI experience', enhanced: '' },
      professionalExperience: { original: 'Data Scientist at Big Data Corp', enhanced: '' },
      academicBackground: { original: 'PhD in Computer Science', enhanced: '' },
      idioms: { original: 'English (fluent), Mandarin (native)', enhanced: '' },
      extraCurricular: { original: 'AI research paper author', enhanced: '' }
    }
  }
]

export default function ProfileManagement() {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [activeProfileId, setActiveProfileId] = useState(profiles[0].id)

  const addProfile = () => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: 'New Profile',
      keywords: '',
      sections: {
        qualificationSummary: { original: '', enhanced: '' },
        professionalExperience: { original: '', enhanced: '' },
        academicBackground: { original: '', enhanced: '' },
        idioms: { original: '', enhanced: '' },
        extraCurricular: { original: '', enhanced: '' }
      }
    }
    setProfiles([...profiles, newProfile])
    setActiveProfileId(newProfile.id)
  }

  const deleteProfile = (id: string) => {
    const updatedProfiles = profiles.filter(profile => profile.id !== id)
    setProfiles(updatedProfiles)
    if (activeProfileId === id) {
      setActiveProfileId(updatedProfiles[0]?.id || '')
    }
  }

  const updateProfileName = (id: string, newName: string) => {
    setProfiles(profiles.map(profile => 
      profile.id === id ? { ...profile, name: newName } : profile
    ))
  }

  const updateProfileKeywords = (id: string, newKeywords: string) => {
    setProfiles(profiles.map(profile => 
      profile.id === id ? { ...profile, keywords: newKeywords } : profile
    ))
  }

  const updateSection = (profileId: string, section: Section, content: string, isEnhanced: boolean) => {
    setProfiles(profiles.map(profile => 
      profile.id === profileId ? {
        ...profile,
        sections: {
          ...profile.sections,
          [section]: isEnhanced 
            ? { ...profile.sections[section], enhanced: content }
            : { ...profile.sections[section], original: content }
        }
      } : profile
    ))
  }

  const enhanceContent = (profileId: string, section: Section) => {
    // Simulating AI enhancement
    setTimeout(() => {
      const enhancedContent = `Enhanced ${profiles.find(p => p.id === profileId)?.sections[section].original}`
      updateSection(profileId, section, enhancedContent, true)
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
      <Card className="w-full max-w-3xl p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile Management</h1>
        <Button onClick={addProfile}><Plus className="mr-2 h-4 w-4" /> New Profile</Button>
      </div>
      <Tabs value={activeProfileId} onValueChange={setActiveProfileId} className="w-full">
        <TabsList className="mb-4 w-full">
          {profiles.map(profile => (
            <TabsTrigger key={profile.id} value={profile.id}>{profile.name}</TabsTrigger>
          ))}
        </TabsList>
        {profiles.map(profile => (
          <TabsContent key={profile.id} value={profile.id}>
            <Card>
              <CardHeader className="flex flex-col space-y-4 pb-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={profile.name}
                    onChange={(e) => updateProfileName(profile.id, e.target.value)}
                    className="text-2xl font-bold bg-transparent border-none hover:bg-gray-100 focus:bg-white"
                    aria-label="Profile name"
                    />
                  <Button variant="destructive" onClick={() => deleteProfile(profile.id)} aria-label="Delete profile">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-full">
                  <Input
                    value={profile.keywords}
                    onChange={(e) => updateProfileKeywords(profile.id, e.target.value)}
                    placeholder="Enter keywords (e.g., React, JavaScript, CSS)"
                    className="w-full"
                    aria-label="Profile keywords"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Object.keys(sectionTitles) as Section[]).map(section => (
                    <div key={section} className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">{sectionTitles[section]}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                          <Textarea
                            value={profile.sections[section].original}
                            onChange={(e) => updateSection(profile.id, section, e.target.value, false)}
                            placeholder={`Enter ${sectionTitles[section]}`}
                            className="w-full"
                            aria-label={`${sectionTitles[section]} content`}
                            />
                          <div className="flex justify-end">
                            <Button onClick={() => enhanceContent(profile.id, section)}>
                              {profile.sections[section].enhanced ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" /> Update
                                </>
                              ) : (
                                <>
                                  <Wand2 className="mr-2 h-4 w-4" /> Enhance
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="flex flex-col">
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm font-medium">{sectionTitles[section]} (Enhanced)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                          {profile.sections[section].enhanced ? (
                            <pre className="whitespace-pre-wrap text-sm h-full">{profile.sections[section].enhanced}</pre>
                          ) : (
                            <Skeleton className="w-full h-[100px]" />
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-end p-2">
                          {profile.sections[section].enhanced && (
                            <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(profile.sections[section].enhanced)}
                            aria-label={`Copy enhanced ${sectionTitles[section]}`}
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
      </Card>
    </div>
  )
}