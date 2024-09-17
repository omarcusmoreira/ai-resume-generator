'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, ChevronDown, ChevronUp } from "lucide-react"
import { useFirestore } from '@/hooks/useFirestore'

type ProfileSection = {
  title: string
  content: string
  enhanced: boolean
}

type Profile = {
  name: string
  sections: ProfileSection[]
}

export default function UserProfileManagementPage() {
  const { appState, loading, error } = useFirestore()
  const [selectedProfile, setSelectedProfile] = useState<number>(0)
  const [expandedSections, setExpandedSections] = useState<boolean[]>([true, false, false, false, false])

  // Mock profiles data (replace with actual data fetching logic)
  const profiles: Profile[] = [
    {
      name: "Frontend Developer",
      sections: [
        { title: "Qualification Summary", content: "Experienced frontend developer...", enhanced: false },
        { title: "Professional Experience", content: "5 years of experience in...", enhanced: false },
        { title: "Academic Background", content: "Bachelor's degree in Computer Science...", enhanced: false },
        { title: "Idioms", content: "English (Fluent), Spanish (Intermediate)", enhanced: false },
        { title: "ExtraCurricular", content: "Open source contributor...", enhanced: false },
      ]
    },
    {
      name: "Mobile Developer",
      sections: [
        { title: "Qualification Summary", content: "Skilled mobile app developer...", enhanced: false },
        { title: "Professional Experience", content: "3 years of experience in...", enhanced: false },
        { title: "Academic Background", content: "Master's degree in Mobile Computing...", enhanced: false },
        { title: "Idioms", content: "English (Fluent), French (Basic)", enhanced: false },
        { title: "ExtraCurricular", content: "Mobile app hackathon winner...", enhanced: false },
      ]
    },
  ]

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newState = [...prev]
      newState[index] = !newState[index]
      return newState
    })
  }

  const enhanceSection = (sectionIndex: number) => {
    // Implement AI enhancement logic here
    console.log(`Enhancing section ${sectionIndex} of profile ${selectedProfile}`)
  }

  const copyResume = () => {
    const resumeText = profiles[selectedProfile].sections.map(section => 
      `${section.title}\n${section.content}\n\n`
    ).join('')
    navigator.clipboard.writeText(resumeText)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold">
              Olá, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">
                {appState?.userType.personalInfo.name || 'Usuário'}
              </span>
            </CardTitle>
            <p className="text-xl md:text-2xl font-semibold mt-2">Gerenciar Perfis</p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Select onValueChange={(value) => setSelectedProfile(parseInt(value))}>
                <SelectTrigger className="w-full md:w-auto">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile, index) => (
                    <SelectItem key={index} value={index.toString()}>{profile.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {profiles[selectedProfile].sections.map((section, index) => (
              <Card key={index} className="mb-4">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection(index)}>
                  <CardTitle className="text-lg flex justify-between items-center">
                    {section.title}
                    {expandedSections[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </CardTitle>
                </CardHeader>
                {expandedSections[index] && (
                  <CardContent>
                    <p className="mb-4">{section.content}</p>
                    <Button onClick={() => enhanceSection(index)} className="w-full md:w-auto">
                      <Sparkles className="mr-2 h-4 w-4" />
                      {section.enhanced ? "Atualizar com IA" : "Aprimorar com IA"}
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}

            <Button onClick={copyResume} className="w-full md:w-auto mt-6">
              <Copy className="mr-2 h-4 w-4" />
              Copiar Currículo Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}