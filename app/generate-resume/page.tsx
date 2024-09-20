'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { FileCode2, Images, Linkedin, Mail, PlusSquare, Sparkles, Users } from "lucide-react"
import { useFirestore } from '@/hooks/useFirestore'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import ProfileWizardComponent from '@/components/profile-wizard/profile-wizard'
import { completeAi } from '@/hooks/useAi'

export default function GenerateResumePage() {
  const { appState, loading, error, refreshProfiles } = useFirestore()
  const [inputText, setInputText] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null)
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false)
  // Remove this line:
  // const [profiles, setProfiles] = useState(appState?.profiles || [])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!appState?.profiles) {
      refreshProfiles()
    }
  }, [appState?.profiles])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value.slice(0, 1000)) // Limit to 1000 characters
  }

  const handleProfileWizardClose = () => {
    setIsProfileWizardOpen(false)
    refreshProfiles()
  }

  const prompts = [
    'Gerar um currículo para vagas selecionadas por algorítmos de recrutamento.',
    'Gerar um currículo tradicional para envio direto para recrutadores.',
    'Escrever uma carta de apresentação para enviar para recrutadores.',
    'Criar Biografia profissional para LinkedIn.'
  ]

  const handleGenerateResume = async () => {
    if (!selectedProfile || !inputText) {
      console.error('Please select a profile and enter a job description')
      return
    }

    setIsGenerating(true)

    try {
      const profile = appState?.profiles?.find(p => p.id === selectedProfile)
      if (!profile) {
        throw new Error('Selected profile not found')
      }

      const { completion } = await completeAi(inputText, profile, appState?.userType.personalInfo)
      console.log('Generated Resume:', completion)
      // TODO: Handle the generated resume (e.g., display it to the user)
    } catch (error) {
      console.error('Error generating resume:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
        <Card className="w-full max-w-3xl p-4 md:p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Olá, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">{appState?.userType.personalInfo.name || 'Usuário'}</span></h1>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Vamos criar seu currículo?</h2>
          <p className="text-gray-500 mb-6 md:mb-8">Escolha um dos prompts abaixo, selecione um perfil desejado e cole a descrição do cargo para criar seu currículo.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
            {prompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "h-auto p-3 md:p-4 flex items-start space-x-3 justify-start",
                  selectedPrompt === index && "border-2 border-purple-500 bg-purple-100"
                )}
                onClick={() => setSelectedPrompt(index)}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  {index === 0 && <FileCode2 className="h-4 w-4 text-purple-600" />}
                  {index === 1 && <Users className="h-4 w-4 text-purple-600" />}
                  {index === 2 && <Mail className="h-4 w-4 text-purple-600" />}
                  {index === 3 && <Linkedin className="h-4 w-4 text-purple-600" />}
                </div>
                <p className="text-sm text-left text-wrap">{prompt}</p>
              </Button>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="mb-6 md:mb-8 w-full md:w-auto"
            onClick={() => setIsProfileWizardOpen(true)}
          >
            <PlusSquare className="mr-2 h-4 w-4" /> Perfil
          </Button>

          <div className="relative">
            <div className="absolute top-2 right-2 z-10">
              <Select onValueChange={(value) => setSelectedProfile(value)}>
                <SelectTrigger className="w-auto h-8 px-2 rounded-full bg-primary text-primary-foreground">
                  <SelectValue placeholder="Escolha um perfil" />
                </SelectTrigger>
                <SelectContent> 
                  {appState?.profiles?.map((profile, index) => (
                    profile.id ? (
                      <SelectItem key={index} value={profile.id}>
                        {profile.profileName || `Profile ${index + 1}`}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>
            {inputText === '' && <div className="absolute top-2 left-2 text-sm text-gray-400 pointer-events-none">
              Cole a descrição da vaga aqui
            </div>}
            <Textarea 
              className="min-h-[100px] pr-24 resize-none pt-10 pl-2 pb-10"
              value={inputText}
              onChange={handleInputChange}
              style={{ height: 'auto', minHeight: '100px' }}
              rows={Math.max(3, inputText.split('\n').length)}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Images className="h-4 w-4" />
              </Button>
              <Button 
                variant="ai" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground"
                onClick={handleGenerateResume}
                disabled={isGenerating || !selectedProfile || !inputText}
              >
                {isGenerating ? (
                  <span className="animate-spin">✨</span>
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              {inputText.length}/1000
            </div>
          </div>
        </Card>
      </div>

      <ProfileWizardComponent 
        isOpen={isProfileWizardOpen} 
        onClose={handleProfileWizardClose}
      />
    </div>
  )
}