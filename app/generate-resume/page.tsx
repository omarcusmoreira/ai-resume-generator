'use client'

// import { useState } from 'react'
import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
import { FileCode2, Images, Mail, NotebookPen, PlusSquare, Sparkles, Users } from "lucide-react"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore } from '@/hooks/useFirestore'
// import ProfileWizardComponent, {  } from '@/components/profile-wizard'
import { Card } from '@/components/ui/card'
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
// import Sidebar from '@/components/Sidebar/page'
import { Input } from '@/components/ui/input'

export default function GenerateResumePage() {
  const { appState, loading, error  } = useFirestore()
//   const [jobDescription] = useState('')
//   const [selectedProfile] = useState<string | null>(null)

//   const handleGenerateResume = async () => {
//     if (selectedProfile && jobDescription) {
//       const profile = appState?.profiles.find(p => p.profileName === selectedProfile)
//       if (profile) {
//         // Replace the following line with your actual resume generation logic
//         // const resume = await generateCompletion(profile, jobDescription)
//         // setGeneratedResume(resume)
//         console.log('Generating resume for profile:', profile, 'with job description:', jobDescription)
//       }
//     }
//   }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
   
      <div className="flex-1 flex flex-col">

{/* Content area */}
<div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
  <Card className="w-full max-w-3xl p-4 md:p-6">
    <h1 className="text-3xl md:text-4xl font-bold mb-2">Olá, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">{appState?.userType.personalInfo.name || 'Usuário'}</span></h1>
    <h2 className="text-xl md:text-2xl font-semibold mb-4">Vamos criar seu currículo?</h2>
    <p className="text-gray-500 mb-6 md:mb-8">Escolha um dos prompts abaixo, selecione um perfil desejado e cole a descrição do cargo para criar seu currículo.</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
      {[
        'Gerar um currículo para vagas selecionadas por algorítmos de recrutamento',
        'Gerar um currículo tradicional para envio direto para recrutadores.',
        'Escrever uma carta de apresentação para enviar para recrutadores.',
        'Criar um plano de estudos para preparar para uma entrevista.'].map((prompt, index) => (
          <Card key={index} className="p-3 md:p-4 flex items-start space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
            {index === 0 && <FileCode2 className="h-4 w-4 text-purple-600" />}
            {index === 1 && <Users className="h-4 w-4 text-purple-600" />}
            {index === 2 && <Mail className="h-4 w-4 text-purple-600" />}
            {index === 3 && <NotebookPen className="h-4 w-4 text-purple-600" />}
          </div>
          <p className="text-sm">{prompt}</p>
        </Card>
      ))}
    </div>

    <Button variant="outline" className="mb-6 md:mb-8 w-full md:w-auto">
      <PlusSquare className="mr-2 h-4 w-4" /> Criar Prompt
    </Button>

    <div className="relative">
      <Input placeholder="Ask whatever you want...." className="pr-24" />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button variant="ghost" size="sm" className="h-full hidden sm:inline-flex">
          <PlusSquare className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Escolher Perfil</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-full hidden sm:inline-flex">
          <Images className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Usar Imagem</span>
        </Button>
        <Button size="sm" className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </Card>
</div>
</div>
)
}
