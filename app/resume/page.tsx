'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppState } from '@/hooks/useAppState'
import { ProfileWizardComponent } from '@/components/profile-wizard'
// import { generateCompletion } from '@/services/openAiService'

type ResumeState = {
  profileName: string
  qualificationSummary: string
  professionalExperience: string
  academicBackground: string
  idioms: { name: string, level: string }[]
  extracurricular: string
}

export default function ResumeGenerator() {

  const [appState, setAppState] = useAppState()
  const [jobDescription, setJobDescription] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [generatedResume] = useState<string | null>(null)

  const handleGenerateResume = async () => {
    if (selectedProfile && jobDescription) {
      const profile = appState.profiles.find(p => p.name === selectedProfile)
      if (profile) {
        // const resume = await generateCompletion(profile, jobDescription)c
        // setGeneratedResume(resume)
        console.log(profile)
      }
    }
  }

  const handleSaveNewProfile = (newProfile: ResumeState) => {
    const profile = {
      name: newProfile.profileName,
      sections: [
        { title: "Qualification Summary", content: newProfile.qualificationSummary, aiEnhanced: "" },
        { title: "Professional Experience", content: newProfile.professionalExperience, aiEnhanced: "" },
        { title: "Academic Background", content: newProfile.academicBackground, aiEnhanced: "" },
        { title: "Idioms", content: newProfile.idioms.map(i => `${i.name}: ${i.level}`).join(', '), aiEnhanced: "" },
        { title: "Extracurricular", content: newProfile.extracurricular, aiEnhanced: "" },
      ]
    }
    setAppState({
      ...appState,
      profiles: [...appState.profiles, profile]
    })
    setIsWizardOpen(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">AI Resume Generator</h1>
        <p className="text-gray-600 mb-6">Select a profile, paste your job description, and let AI create a tailored resume for you.</p>
        
        {isWizardOpen ? (
          <ProfileWizardComponent 
            isOpen={isWizardOpen} 
            onClose={() => setIsWizardOpen(false)} 
            onSave={handleSaveNewProfile} 
          />
        ) : appState.profiles.length > 0 ? (
          <Select onValueChange={setSelectedProfile}>
            <SelectTrigger className="mb-4">
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {appState.profiles.map((profile, index) => (
                <SelectItem key={index} value={profile.name}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="mb-4">
            <p className="text-red-500">No profiles found.</p>
            <Button onClick={() => setIsWizardOpen(true)} className="text-white hover:underline">
              Create a profile
            </Button>
          </div>
        )}

        <Textarea 
          placeholder="Paste job description here..." 
          className="mb-4 h-64"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <div className="flex justify-between items-center">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleGenerateResume}
            disabled={!selectedProfile || !jobDescription}
          >
            <Sparkles className="mr-2 h-4 w-4" />Generate Resume
          </Button>
          <Button variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Zap className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>
        {generatedResume && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-2">Generated Resume</h2>
            <pre className="bg-gray-100 p-4 rounded">{generatedResume}</pre>
          </div>
        )}
      </div>
    </div>
  )
}