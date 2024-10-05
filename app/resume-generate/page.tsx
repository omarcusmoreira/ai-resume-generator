'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Briefcase, FileCode2, Linkedin, Mail, PlusSquare, Sparkles, Users } from "lucide-react"
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { generateResume } from '@/aiPrompts/generateResume'
import { generateResumeWithJobDescription } from '@/aiPrompts/generateResumeWithJobDescription'
import { v4 } from 'uuid'
import { ResumeType } from '@/types/resumes'
import { validateCompletion } from '../utils/validateJSONCompletion'
import { trimToJSON } from '../utils/trimToJSON'
import { generateCoverLetter } from '@/aiPrompts/generateCoverLetter'
import { generateLinkedinBio } from '@/aiPrompts/generateLinkedinBio'
import { ResumeGenerationDialog } from '@/components/ResumeGenerationDialog'
import BioCoverLetterDialog from '@/components/BioCoverLetterDialog/'
import ProfileCreationDialogComponent from '@/components/ProfileCreationDialog'
import { UpgradeDialog } from '@/components/UpgradeAlertDialog'
import { Timestamp } from 'firebase/firestore'
import { useUserDataStore } from '@/stores/userDataStore'
import { useProfileStore } from '@/stores/profileStore'
import { useQuotaStore } from '@/stores/quotaStore'
import { useResumeStore } from '@/stores/resumeStore'
import { generateResumeHTML } from '@/aiPrompts/generateResumeHTML'

export default function GenerateResumePage() {

  const { userData } = useUserDataStore();
  const { profiles } = useProfileStore();
  const { addResume } = useResumeStore();
  const { quotas, decreaseQuota } = useQuotaStore();

  const [isPremiumEditor, setIsPremiumEditor] = useState(false);

  const [inputText, setInputText] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState<number>(0)
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [resumeId, setResumeId] = useState<string>()
  const [isCoverLetterDialogOpen, setIsCoverLetterDialogOpen] = useState(false)
  const [coverLetterCompletion, setCoverLetterCompletion] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [generationAttempt, setGenerationAttempt] = useState<number>(0)
  const [hasGenerationFailed, setHasGenerationFaild] = useState(false)
  const [isGenerationSuccessful, setIsGenerationSuccessful] = useState(false)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [upgradeDialogTitle, setUpgradeDialogTitle] = useState<'Perfis' | 'Currículos' | 'Interações'>('Interações')

  const prompts = [
    'Gerar um currículo ATS otimizado para algoritmos de recrutamento.',
    'Gerar um currículo baseado em uma vaga específica.',
    'Escrever uma carta de apresentação para enviar para recrutadores.',
    'Criar Biografia profissional para LinkedIn.',
    'Criar um currículo com o Editor Avançado (maior controle sobre o resultado).'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value.slice(0, 1000)) 
  }

  const handleProfileCreationDialogClose = () => {
    setTimeout(() => setRefreshKey(prevKey => prevKey + 1), 500); 
    setIsProfileWizardOpen(false);
  }

  const handleResumeGenerationDialogClose = () => {
    setIsDialogOpen(false)
    setIsGenerationSuccessful(false)
    setHasGenerationFaild(false)
    setGenerationAttempt(0)
  }

  const handleGenerateResume = async () => {
    if (quotas.resumes && quotas.resumes <= 0) {
      setUpgradeDialogTitle('Currículos')
      setIsUpgradeDialogOpen(true)
      return;
    }
    if (!selectedProfile) {
      console.error('Please select a profile and enter a job description');
      return;
    }
    if (!userData){
      console.error('No user');
      return
    }
    setIsDialogOpen(true)
    setIsGenerating(true)
    
    const newResumeId = v4();
    setResumeId(newResumeId);
    
    if (selectedPrompt === 4){
      setIsPremiumEditor(true)
      try{
        const profile = profiles?.find(p => p.id === selectedProfile);
        if (!profile) {
          throw new Error('Selected profile not found');
        }
        const result = await generateResumeHTML(profile, userData.personalInfo);
        const completion = result.completion;
        console.log(completion)
        const uniqueId = newResumeId.slice(0, 2);
        const currentDate = new Date();
        const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;
        const resume = {
          id: newResumeId,
          createdAt: Timestamp.now(),
          resumeName: `CV_${uniqueId}_${formattedDate}_${userData.personalInfo.name.replace(/\s+/g, '_')}_${profile.profileName.replace(/\s+/g, '_')}.pdf`,
          contentHTML: completion,
          isAccepted: false,
          profileName: profile.profileName, 
          updatedAt: Timestamp.now(),
          isEditor: true,
        } as ResumeType;

        await addResume(newResumeId, resume);
        await decreaseQuota('resumes')
        setIsGenerationSuccessful(true)
        setIsGenerating(false)
        return;
      }catch(error){
        console.log(error)
      }
    }

    try {
      const profile = profiles?.find(p => p.id === selectedProfile);
      if (!profile) {
        throw new Error('Selected profile not found');
      }

      let currentAttempt = 0;
      const maxAttempts = 7; 

      do {
        try {        
          let completion;
          if (selectedPrompt === 0) {
            const result = await generateResume(profile);
            completion = result.completion;
          } else if (selectedPrompt === 1) {
            const result = await generateResumeWithJobDescription(inputText, profile);
            completion = result.completion;
          } else {
            throw new Error('Invalid prompt selected');
          }

          console.log(completion)
          const trimmedCompletion = trimToJSON(completion);

          if (validateCompletion(trimmedCompletion)) {
            const uniqueId = newResumeId.slice(0, 2); // Use the first 2 characters of the UUID
            const currentDate = new Date();
            const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

            const resume = {
              id: newResumeId,
              createdAt: Timestamp.now(),
              resumeName: `CV_${uniqueId}_${formattedDate}_${userData.personalInfo.name.replace(/\s+/g, '_')}_${profile.profileName.replace(/\s+/g, '_')}.pdf`,
              contentJSON: trimmedCompletion,
              isAccepted: false,
              profileName: profile.profileName, 
              updatedAt: Timestamp.now(),
            } as ResumeType;
            await addResume(newResumeId, resume);
            setIsGenerationSuccessful(true)
            return;
          }
        } catch (error) {
          console.error('Error generating resume:', error);
        }
        currentAttempt++;
        setGenerationAttempt(currentAttempt); 
      } while (currentAttempt < maxAttempts);

      setHasGenerationFaild(true)
    } catch (error) {
      console.error('Erro ao gerar currículo:', error);
      setHasGenerationFaild(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (quotas.interactions &&  quotas.interactions <= 0) {
      setUpgradeDialogTitle('Interações')
      setIsUpgradeDialogOpen(true)
      return;
    }
    if (!selectedProfile || !inputText) {
      console.error('Please select a profile and enter a job description');
      return;
    }
    if (userData && selectedProfile) {
      const profile = profiles?.find(p => p.id === selectedProfile);
      if (!profile) {
        throw new Error('Selected profile not found');
      }
      setIsGenerating(true)
      const { completion } = await generateCoverLetter(inputText, profile, userData)
      console.log(completion);
      setIsGenerating(false)
      setCoverLetterCompletion(completion)
      setIsCoverLetterDialogOpen(true)
      setTimeout(() => setRefreshKey(prevKey => prevKey + 1), 500); 
      decreaseQuota('interactions')
    }
  } 

  const handleGenerateLinkedinBio = async () => {
    if (quotas.interactions && quotas.interactions <= 0) {
      setIsUpgradeDialogOpen(true)
      return;
    }
    if (!selectedProfile) {
      console.error('Please select a profile');
      return;
    }
    setIsGenerating(true)
    const profile = profiles?.find(p => p.id === selectedProfile);
    if (!profile) {
      throw new Error('Selected profile not found');
    }
    setIsGenerating(true)
    const { completion } = await generateLinkedinBio(profile)
    console.log(completion);
    setIsGenerating(false)
    setCoverLetterCompletion(completion)
    setTimeout(() => setRefreshKey(prevKey => prevKey + 1), 500); 
    setIsCoverLetterDialogOpen(true)

    decreaseQuota('interactions')
  } 

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-2 md:p-8 overflow-auto flex items-center justify-center mb-20">
        <Card className="w-full max-w-3xl p-4 md:p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Olá, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">{userData?.personalInfo.name || 'Usuário'}</span></h1>
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Vamos criar seu currículo?</h2>
          <p className="text-gray-500 mb-6 md:mb-8">Selecione o perfil desejado, escolha um dos prompts abaixo e, caso deseje, forneça a descrição do cargo para criar seu currículo.</p>

          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center">
              <Select 
                key={refreshKey}
                onValueChange={(value) => setSelectedProfile(value)}
                disabled={profiles.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={profiles.length === 0 ? "Crie seu primeiro perfil" : "Escolha um perfil"}/>
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
              <Button 
                variant="outline" 
                className="ml-4"
                onClick={() => setIsProfileWizardOpen(true)}
                disabled={quotas?.profiles === 0}
              >
                <PlusSquare className="md:mr-2 h-4 w-4" />
                <span className="hidden md:block">Perfil</span>
              </Button>
            </div>
            <Button 
              variant="ai" 
              className="rounded-full bg-primary text-white"
              onClick={
                  selectedPrompt === 2 ?
                  handleGenerateCoverLetter :
                  selectedPrompt === 3 ?
                  handleGenerateLinkedinBio :
                  handleGenerateResume
              }
              disabled={
                isGenerating || 
                ((selectedPrompt === 0 || selectedPrompt === 3 || selectedPrompt === 4) && !selectedProfile) ||
                ((selectedPrompt === 1 || selectedPrompt === 2) && !inputText)
              }
            >
              {isGenerating ? (
                <span className="animate-spin md:mr-2">✨</span>
              ) : (
                <Sparkles className="h-4 w-4 md:mr-2" />
              )}
              <span className="hidden md:block">{selectedPrompt === 2 ? 'Gerar Carta de Apresentação' : selectedPrompt === 3 ? 'Gerar Biografia' : 'Gerar Currículo'}</span>
            </Button>
          </div>
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
                autoFocus={index === 0}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  {index === 0 && <FileCode2 className="h-4 w-4 text-purple-600" />}
                  {index === 1 && <Users className="h-4 w-4 text-purple-600" />}
                  {index === 2 && <Mail className="h-4 w-4 text-purple-600" />}
                  {index === 3 && <Linkedin className="h-4 w-4 text-purple-600" />}
                  {index === 4 && <Briefcase className="h-4 w-4 text-purple-600" />}

                </div>
                <p className="text-sm text-left text-wrap">{prompt}</p>
              </Button>
            ))}
          </div>

          {(selectedPrompt === 1 || selectedPrompt === 2) && (
            <div className="relative">
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
              <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                {inputText.length}/1000
              </div>
            </div>
          )}
        </Card>
      </div>
      <ProfileCreationDialogComponent 
        isOpen={isProfileWizardOpen} 
        onClose={handleProfileCreationDialogClose}
      />
      <ResumeGenerationDialog
        isDialogOpen={isDialogOpen}
        onClose={handleResumeGenerationDialogClose}
        isGenerationSuccessful={isGenerationSuccessful}
        hasGenerationFailed={hasGenerationFailed}
        generationAttempt={generationAttempt}
        resumeId={resumeId || ''}
        isGenerating={isGenerating}
        premiumEditor={isPremiumEditor}
      />
      <BioCoverLetterDialog 
        isOpen={isCoverLetterDialogOpen} 
        onClose={() => setIsCoverLetterDialogOpen(false)}
        dialogTitle={selectedPrompt === 2 ? 'Carta de Apresentação' : 'Biografia para LinkedIn'}
        completion={coverLetterCompletion}
        quota={quotas?.interactions || 0}
      />
      <UpgradeDialog
        isOpen={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        title={upgradeDialogTitle}
      />
    </div>
  )
}