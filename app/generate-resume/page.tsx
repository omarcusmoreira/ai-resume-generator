'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { FileCheck, FileCode2, Images, Linkedin, Mail, PlusSquare, Sparkles, Users } from "lucide-react"
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import ProfileWizardComponent from '@/components/profile-wizard/profile-wizard'
import { generateATSResumeJSON } from '@/hooks/useAi'
import { useRouter } from 'next/navigation'
import { v4 } from 'uuid'
import { getUserData } from '@/services/userServices'
import { getProfiles } from '@/services/profileServices'
import { UserDataType } from '@/types/users'
import { ProfileType } from '@/types/profiles'
import { ResumeType } from '@/types/resumes'
import { addResume } from '@/services/resumeServices'
import { validateCompletion } from '../utils/validateJSONCompletion'
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { trimToJSON } from '../utils/trimToJSON'
import { AlertCircle } from "lucide-react"

export default function GenerateResumePage() {

  const [userData, setUserData] = useState<UserDataType>()
  const [profiles, setProfiles] = useState<ProfileType[]>()
  const [inputText, setInputText] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState<number>()
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string>()
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('')
  const [isGenerationComplete, setIsGenerationComplete] = useState(false)
  const [generationError, setGenerationError] = useState(false)
  const [resumeId, setResumeId] = useState<string>()
  const [profilesKey, setProfilesKey] = useState(0)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const fetchedUser = await getUserData();
    const fetchedProfiles = await getProfiles();
    if (fetchedUser) {
      setUserData(fetchedUser);
    }
    if (fetchedProfiles) {
      setProfiles(fetchedProfiles);
      setProfilesKey(prevKey => prevKey + 1); // Increment the key to force re-render
    }  
  };
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setProfilesKey(prevKey => prevKey + 1); // Force re-render of Select component
    }
  }, [profiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value.slice(0, 1000)) 
  }

  const handleProfileWizardClose = () => {
    fetchData();
    setProfilesKey(prevKey => prevKey + 1); // Increment the key to force re-render 
    setIsProfileWizardOpen(false);
  }

  const prompts = [
    'Gerar um currículo para vagas selecionadas por algorítmos de recrutamento.',
    'Gerar um currículo tradicional para envio direto para recrutadores.',
    'Escrever uma carta de apresentação para enviar para recrutadores.',
    'Criar Biografia profissional para LinkedIn.'
  ]

  const handleGenerateResume = async () => {
    if (!selectedProfile || !inputText) {
      console.error('Please select a profile and enter a job description');
      return;
    }
    setIsDialogOpen(true)
    setIsGenerating(true)
    setGenerationStatus('Iniciando geração do currículo...')
    
    const newResumeId = v4(); // Generate the ID here
    setResumeId(newResumeId);

    try {
      const profile = profiles?.find(p => p.id === selectedProfile);
      if (!profile) {
        throw new Error('Selected profile not found');
      }
  
      let attempts = 0;
      const maxAttempts = 7; 
  
      do {
        try {
          setGenerationStatus(`Tentativa ${attempts + 1} de ${maxAttempts}...`)
          const {completion} = await generateATSResumeJSON(inputText, profile);
          setGenerationStatus('Validando currículo gerado...');
          const trimmedCompletion = trimToJSON(completion);
          console.log(resumeId);

          if (validateCompletion(trimmedCompletion)) {
            const resume = {
              id: newResumeId, // Use the generated ID
              contentJSON: trimmedCompletion,
            } as ResumeType;
            setGenerationStatus('Currículo gerado com sucesso!');
            await addResume(newResumeId, resume); // Use the generated ID
            setIsGenerationComplete(true)
            return;
          } else {
            setGenerationStatus('Currículo inválido, tentando gerar novamente...');
          }
        } catch (error) {
          console.error('Error generating resume:', error);
          setGenerationStatus('Erro ao gerar currículo, tentando novamente...');
        }
        attempts++;
      } while (attempts < maxAttempts);
  
      setGenerationError(true)
      setGenerationStatus('Ops, não foi possível gerar seu currículo. Tente novamente mais tarde.');
    } catch (error) {
      console.error('Erro ao gerar currículo:', error);
      setGenerationError(true)
      setGenerationStatus('Erro ao gerar currículo. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsGenerationComplete(false)
    setGenerationError(false)
    setGenerationStatus('')
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
        <Card className="w-full max-w-3xl p-4 md:p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Olá, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">{userData?.personalInfo.name || 'Usuário'}</span></h1>
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
                disabled={ index !== 0}
                autoFocus={index === 0}
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
              <Select 
                key={profilesKey}
                onValueChange={(value) => setSelectedProfile(value)}
              >
                <SelectTrigger key={profilesKey} className="w-auto h-8 px-2 rounded-full bg-primary text-primary-foreground">
                  <SelectValue placeholder="Escolha um perfil" />
                </SelectTrigger>
                <SelectContent> 
                  {profiles?.map((profile, index) => (
                    profile.id ? (
                      <SelectItem key={profile.id} value={profile.id}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <div className="flex flex-col items-center justify-center space-y-4">
            {isGenerating && (
              <Sparkles className="h-16 w-16 text-gray-500 animate-spin" />
            )}
            {isGenerationComplete && (
              <FileCheck className="h-16 w-16 text-primary" />
            )}
            {generationError && (
              <AlertCircle className="h-16 w-16 text-red-500" />
            )}
            <p className="text-center font-semibold">{generationStatus}</p>
            {isGenerating && (
              <p className="text-sm text-gray-500">Isso pode levar alguns minutos...</p>
            )}
          </div>
          <DialogFooter>
            {generationError && (
              <Button onClick={handleCloseDialog}>Fechar</Button>
            )}
            {isGenerationComplete && (
              <Button onClick={() => router.push(`/resume-preview?resumeId=${resumeId}`)}>
                Ver Currículo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    )
  }