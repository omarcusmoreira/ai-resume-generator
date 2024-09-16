'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfileType } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useFirestore} from '@/hooks/useFirestore'
import { v4 } from 'uuid'
 
const initialState: ProfileType = {
  id: '',
  profileName: '',
  sections: {
    academicBackground: { content: '', aiEnhanced: '' },
    keywords: { content: '', aiEnhanced: '' },
    summary: { content: '', aiEnhanced: '' },
    professionalExperience: { content: '', aiEnhanced: '' },
    idioms: { content: '', aiEnhanced: '' },
    extraCurricular: { content: '', aiEnhanced: '' },
  },
}

type ProfileWizardComponentProps = {
   isOpen: boolean, 
   onClose: () => void,
  }

export default function ProfileWizardComponent({ isOpen, onClose }: ProfileWizardComponentProps) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<ProfileType>(initialState)

  const totalSteps = 6

  const { user } = useAuth();

  const { addProfile } = useFirestore();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleInputChange = (section: keyof ProfileType['sections'], value: string) => {
    setProfile(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: { ...prev.sections[section], content: value },
      },
    }))
  }

  const handleProfileNameChange = (value: string) => {
    setProfile(prev => ({ ...prev, profileName: value }))
  }

  const handleAIEnhance = (section: keyof ProfileType['sections']) => {
    // Simulating AI enhancement (replace with actual AI call)
    const enhancedContent = `AI enhanced: ${profile.sections[section].content}`
    setProfile(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: { ...prev.sections[section], aiEnhanced: enhancedContent },
      },
    }))
  }

  const handleFinish = () => {
    if (user) {
      const profileWithId = { ...profile, id: v4() }
      addProfile(profileWithId)
      onClose();
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Input
              placeholder="Profile Name"
              value={profile.profileName}
              onChange={(e) => handleProfileNameChange(e.target.value)}
            />
            <div className="flex space-x-2">
              <Input
                placeholder="Keywords"
                value={profile.sections.keywords.content}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
              />
              <Button onClick={() => handleAIEnhance('keywords')}>AI Enhance</Button>
            </div>
          </div>
        )
      case 2:
        return (
          <Textarea
            placeholder="Qualification Summary"
            value={profile.sections.summary.content}
            onChange={(e) => handleInputChange('summary', e.target.value)}
          />
        )
      case 3:
        return (
          <Textarea
            placeholder="Professional Experience"
            value={profile.sections.professionalExperience.content}
            onChange={(e) => handleInputChange('professionalExperience', e.target.value)}
          />
        )
      case 4:
        return (
          <Textarea
            placeholder="Academic Background"
            value={profile.sections.academicBackground.content}
            onChange={(e) => handleInputChange('academicBackground', e.target.value)}
          />
        )
      case 5:
        return (
          <Textarea
            placeholder="Idioms"
            value={profile.sections.idioms.content}
            onChange={(e) => handleInputChange('idioms', e.target.value)}
          />
        )
      case 6:
        return (
          <Textarea
            placeholder="Extracurricular/Certifications"
            value={profile.sections.extraCurricular.content}
            onChange={(e) => handleInputChange('extraCurricular', e.target.value)}
          />
        )
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Profile</h3>
            <p>Profile Name: {profile.profileName}</p>
            <p>Keywords: {profile.sections.keywords.content}</p>
            <p>Summary: {profile.sections.summary.content}</p>
            <p>Professional Experience: {profile.sections.professionalExperience.content}</p>
            <p>Academic Background: {profile.sections.academicBackground.content}</p>
            <p>Idioms: {profile.sections.idioms.content}</p>
            <p>Extracurricular/Certifications: {profile.sections.extraCurricular.content}</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Registration Wizard - Step {step}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderStepContent()}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i + 1 <= step ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="space-x-2">
              <Button onClick={handleBack} disabled={step === 1}>
                Back
              </Button>
              <Button onClick={step === totalSteps ? handleFinish : handleNext}>
                {step === totalSteps ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}