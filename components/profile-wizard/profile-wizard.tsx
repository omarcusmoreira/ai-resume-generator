'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfileType } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useFirestore} from '@/hooks/useFirestore'
import { Sparkles } from 'lucide-react'
import { DialogDescription } from '@radix-ui/react-dialog'
 
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

const stepsData: { [key: number]: { title: string; subtitle: string; placeholder: string } } = {
  1: {
    title: 'Nome do perfil', 
    subtitle: 'De um nome para o seu perfil.',
    placeholder: 'Desenvolvedor Front-end'
  },
  2: {
    title: 'Resumo de qualificações',
    subtitle: 'Quais são seus pontos fortes e tecnologias que domina?',
    placeholder: 'Desenvolvedor de software com 5 anos de experiência em front-end, especializado em React e JavaScript. Habilidade comprovada na criação de interfaces de usuário responsivas ...'
  },
  3: {
    title: 'Experiência Profissional',
    subtitle: 'Descreva suas experiências profissionais nas empresas em que trabalhou.',
    placeholder: 'Empresa XPTO, abril 2020 a atual, desenvolvedor pleno - Atuei com a criação de projetos utilizando React e Node.js, focado na construção de aplicações web escaláveis. Desenvolvi e mantive integrações com APIs REST...',
  },
  4: {
    title: 'Formação Acadêmica', 
    subtitle: 'Descreva sua formação acadêmica e cursos complementares.',
    placeholder: 'Bacharelado em Ciência da Computação pela Universidade Federal de São Paulo (2014-2018). Formação focada em desenvolvimento ...',
  },
  5: {
    title: 'Idiomas', 
    subtitle: 'Quais idiomas você domina?',
    placeholder: 'Inglês fluente (C1) com experiência em ambientes corporativos internacionais e Espanhol intermediário ...',
  },
  6: {
    title: 'Atividades Complementares/Certificações', 
    subtitle: 'Possui alguma certificação ou atividade complementar?',
    placeholder: 'Certificação PMP (Project Management Professional) pelo PMI, cursos de especialização em gerenciamento ágil de projetos (Scrum e Kanban) ...',
  }
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
    if (isStepValid() && step < totalSteps) {
      setStep(step + 1)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profile.profileName.trim() !== '' && profile.sections.keywords.content.trim() !== ''
      case 2:
        return profile.sections.summary.content.trim() !== ''
      case 3:
        return profile.sections.professionalExperience.content.trim() !== ''
      case 4:
        return profile.sections.academicBackground.content.trim() !== ''
      case 5:
        return profile.sections.idioms.content.trim() !== ''
      case 6:
        return profile.sections.extraCurricular.content.trim() !== ''
      default:
        return true
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
      const profileWithId = { ...profile }
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
              placeholder={stepsData[1].placeholder}
              value={profile.profileName}
              onChange={(e) => handleProfileNameChange(e.target.value)}
              required
            />
            <div className="flex space-x-2">
              <Input
                placeholder="Palavras-chave"
                value={profile.sections.keywords.content}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                required
              />
              <Button variant="ai" onClick={() => handleAIEnhance('keywords')}>
                Sugerir
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )
      case 2:
        return (
          <Textarea
            placeholder={stepsData[2].placeholder}
            value={profile.sections.summary.content}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            required
          />
        )
      case 3:
        return (
          <Textarea
            placeholder={stepsData[3].placeholder}
            value={profile.sections.professionalExperience.content}
            onChange={(e) => handleInputChange('professionalExperience', e.target.value)}
            required
          />
        )
      case 4:
        return (
          <Textarea
            placeholder={stepsData[4].placeholder}
            value={profile.sections.academicBackground.content}
            onChange={(e) => handleInputChange('academicBackground', e.target.value)}
            required
          />
        )
      case 5:
        return (
          <Textarea
            placeholder={stepsData[5].placeholder}
            value={profile.sections.idioms.content}
            onChange={(e) => handleInputChange('idioms', e.target.value)}
            required
          />
        )
      case 6:
        return (
          <Textarea
            placeholder={stepsData[6].placeholder}
            value={profile.sections.extraCurricular.content}
            onChange={(e) => handleInputChange('extraCurricular', e.target.value)}
            required
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
            <DialogTitle>{stepsData[step].title}</DialogTitle>
            <DialogDescription>{stepsData[step].subtitle}</DialogDescription>
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
                Voltar
              </Button>
              <Button 
                onClick={step === totalSteps ? handleFinish : handleNext}
                disabled={!isStepValid()}
              >
                {step === totalSteps ? 'Salvar' : 'Avançar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}