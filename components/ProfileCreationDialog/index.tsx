'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles } from 'lucide-react'
import { DialogDescription } from '@radix-ui/react-dialog'
import { v4 } from 'uuid'
import { ProfileType } from '@/types/profiles'
import { useAuthStore } from '@/stores/authStore'
import { useQuotaStore } from '@/stores/quotaStore'
import { useProfileStore } from '@/stores/profileStore'
import { generateKeywords } from '@/aiPrompts/generateKeywords'
import { useToast } from '@/hooks/use-toast'
 
const initialState: ProfileType = {
  id: '',
  profileName: '',
  sections: {
    academicBackground: '',
    keywords: '',
    summary: '',
    professionalExperience: '',
    idioms: '',
    extraCurricular: '',
  },
}

const stepsData: { [key: number]: { title: string; subtitle: string; placeholder: string, hint: string } } = {
  1: {
    title: 'Nome do perfil', 
    subtitle: 'De um nome para o seu perfil.',
    placeholder: 'Desenvolvedor Front-end',
    hint: 'Este é o cargo desejado para a sua busca.'
  },
  2: {
    title: 'Resumo de qualificações',
    subtitle: 'Quais são seus pontos fortes e tecnologias que domina?',
    placeholder: 'Desenvolvedor de software com 5 anos de experiência em front-end, especializado em React e JavaScript. Habilidade comprovada na criação de interfaces de usuário responsivas ...',
    hint: 'Dica: Descreva suas principais qualificações e experiências.'
  },
  3: {
    title: 'Experiência Profissional',
    subtitle: 'Descreva suas experiências profissionais nas empresas em que trabalhou.',
    placeholder: 'Desenvolvedor Senior na Empresa XPTO de abril 2020 a atual, desenvolvedor pleno na empresa Technology Solutions...',
    hint: 'Dica: Liste as empresas e cargos que ocupou, com a data de início e término.'
  },
  4: {
    title: 'Formação Acadêmica', 
    subtitle: 'Descreva sua formação acadêmica e cursos complementares.',
    placeholder: 'Bacharelado em Ciência da Computação pela Universidade Federal de São Paulo (2014-2018). Formação focada em desenvolvimento ...',
    hint: 'Dica: Liste as instituições de ensino e cursos que realizou, com a data de conclusão.'
  },
  5: {
    title: 'Idiomas', 
    subtitle: 'Quais idiomas você domina?',
    placeholder: 'Inglês fluente (C1) com experiência em ambientes corporativos internacionais e Espanhol intermediário ...',
    hint: 'Dica: Liste os idiomas que domina, com o nível de fluência.'
  },
  6: {
    title: 'Atividades Complementares/Certificações', 
    subtitle: 'Possui alguma certificação ou atividade complementar?',
    placeholder: 'Certificação PMP (Project Management Professional) pelo PMI, cursos de especialização em gerenciamento ágil de projetos (Scrum e Kanban) ...',
    hint: 'Dica: Liste as certificações e atividades complementares que possui.'
  }
}

type ProfileWizardComponentProps = {
   isOpen: boolean, 
   onClose: () => void,
  }

export default function ProfileCreationDialog({ isOpen, onClose }: ProfileWizardComponentProps) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<ProfileType>(initialState)
  const [suggesting, setSuggesting] = useState<boolean>(false)
  const totalSteps = 6

  const { user } = useAuthStore();
  const { quotas, decreaseQuota } = useQuotaStore();
  const { loading, addProfile } = useProfileStore();
  const { toast } = useToast();

  const handleNext = () => {
    if (isStepValid() && step < totalSteps) {
      setStep(step + 1)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profile.profileName.trim() !== '' && profile.sections.keywords.trim() !== ''
      case 2:
        return profile.sections.summary.trim() !== ''
      case 3:
        return profile.sections.professionalExperience.trim() !== ''
      case 4:
        return profile.sections.academicBackground.trim() !== ''
      case 5:
        return profile.sections.idioms.trim() !== ''
      case 6:
        return true
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
        [section]: value,
      },
    }))
  }

  const handleSuggestedKeywords = async (value: string) => {
    setSuggesting(true)
    const { completion } = await generateKeywords(value)
    if (completion) {
      setProfile(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          keywords: completion,
        },
      }))
    }
    setSuggesting(false)
  }

  const handleProfileNameChange = (value: string) => {
    setProfile(prev => ({ ...prev, profileName: value }))
  }

  const handleFinish = async () => {
    if (user) {
      const profileId = v4();
      await addProfile(profileId, profile)
      await decreaseQuota('profiles')
      toast({
        title: "Perfil salvo",
        description: `Voce ainda tem mais ${quotas.profiles && quotas.profiles-1} perfis`,
      });
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
              autoFocus
            />
            <div className="flex space-x-2">
              <Input
                placeholder="Palavras-chave"
                value={profile.sections.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                required
              />
              <Button disabled={suggesting} variant="ai" onClick={() => handleSuggestedKeywords(profile.profileName)}>
                Sugerir
                <Sparkles className={`w-4 h-4 ml-2 ${suggesting ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        )
      case 2:
        return (
          <>
          <Textarea
            placeholder={stepsData[2].placeholder}
            value={profile.sections.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            required
            autoFocus
          />
          <span className="text-[10px] mt-1 text-gray-500">{stepsData[2].hint}</span>
          </>
        )
      case 3:
        return (
          <>
          <Textarea
            placeholder={stepsData[3].placeholder}
            value={profile.sections.professionalExperience}
            onChange={(e) => handleInputChange('professionalExperience', e.target.value)}
            required
            autoFocus
            />
          <span className="text-[10px] mt-1 text-gray-500">{stepsData[3].hint}</span>
          </>
        )
      case 4:
        return (
          <>
          <Textarea
            placeholder={stepsData[4].placeholder}
            value={profile.sections.academicBackground}
            onChange={(e) => handleInputChange('academicBackground', e.target.value)}
            required
            autoFocus
          />
            <span className="text-[10px] mt-1 text-gray-500">{stepsData[4].hint}</span>
          </>
        )
      case 5:
        return (
          <>
          <Textarea
            placeholder={stepsData[5].placeholder}
            value={profile.sections.idioms}
            onChange={(e) => handleInputChange('idioms', e.target.value)}
            required
            autoFocus
          />
          <span className="text-[10px] mt-1 text-gray-500">{stepsData[5].hint}</span>
          </>
        )
      case 6:
        return (
          <>
          <Textarea
            placeholder={stepsData[6].placeholder}
            value={profile.sections.extraCurricular}
            onChange={(e) => handleInputChange('extraCurricular', e.target.value)}
            required
            autoFocus
          />
          <span className="text-[10px] mt-1 text-gray-500">{stepsData[6].hint}</span>
          </>
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
            <DialogDescription className="pt-2">{stepsData[step].subtitle}</DialogDescription>
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
                disabled={!isStepValid() || loading}
              >
                {step === totalSteps ? 'Salvar' : 'Avançar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}