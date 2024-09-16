'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore } from '@/hooks/useFirestore'
import ProfileWizardComponent, {  } from '@/components/profile-wizard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResumeGenerator() {
  const { appState, loading, error  } = useFirestore()
  const [jobDescription, setJobDescription] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [generatedResume] = useState<string | null>(null)

  const handleGenerateResume = async () => {
    if (selectedProfile && jobDescription) {
      const profile = appState?.profiles.find(p => p.profileName === selectedProfile)
      if (profile) {
        // Replace the following line with your actual resume generation logic
        // const resume = await generateCompletion(profile, jobDescription)
        // setGeneratedResume(resume)
        console.log('Generating resume for profile:', profile, 'with job description:', jobDescription)
      }
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-heading">Gerador de Currículos ATS</CardTitle>
        </CardHeader>
        <CardContent className="max-w-2xl mx-auto">
          <p className="text-gray-600 mb-6">
            Select a profile, paste your job description, and let AI create a tailored resume for you.
          </p>
          {isWizardOpen ? (
            <ProfileWizardComponent 
              isOpen={isWizardOpen} 
              onClose={() => setIsWizardOpen(false)} 
            />
          ) : appState?.profiles && appState?.profiles?.length > 0 ? (
            <Select value={selectedProfile || undefined} onValueChange={setSelectedProfile}>
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {appState.profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.profileName}>
                    {profile.profileName}
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
        </CardContent>
      </Card>
    </div>
  )
}