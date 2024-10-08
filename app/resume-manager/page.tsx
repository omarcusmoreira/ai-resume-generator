"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarIcon, SearchIcon, FilterIcon, User, Sparkles } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useResumeStore } from '@/stores/resumeStore'
import { useQuotaStore } from '@/stores/quotaStore'
import { Badge } from '@/components/ui/badge'

export default function ResumeManagerPage() {

  const { resumes } = useResumeStore();
  const { quotas } = useQuotaStore();
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")

  const orderedResumes = resumes ? [...resumes].sort((a, b) => {

    const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
    return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
  }) : [];

  const filteredResumes = orderedResumes.filter(resume => 
    resume.resumeName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter === "all" || (resume.profileName && resume.profileName.toLowerCase().includes(filter.toLowerCase())) || (resume.resumeName && resume.resumeName.toLowerCase().includes(filter.toLowerCase())))
  );

  return (
    <div className="flex-1 p-2 md:p-8 overflow-auto flex items-center justify-center mb-20">
      <Card className='w-full max-w-3xl p-2 md:p-6'>
        <div className="container mx-auto p-2 md:p-4 space-y-6">
          <div className='flex w-full justify-between'>
            <h1 className="text-3xl font-bold">Meus Currículos</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/resume-generate" passHref>
                    <Button variant="ai" className="rounded-full bg-primary text-white">
                      <Sparkles className='h-4 w-4 mr-2' />
                      Gerar Currículo
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{`Voce ainda tem ${quotas.resumes} currículos disponiveis`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex space-x-4">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><FilterIcon className="mr-2 h-4 w-4" />Filtrar</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setFilter("all")}>Todos</DropdownMenuItem>
                {Array.from(new Set(resumes
                  .map(resume => resume.profileName)
                  .filter(profile => profile)))
                  .map(profile => (
                    <DropdownMenuItem key={profile} onSelect={() => setFilter(profile)}>{profile}</DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {filteredResumes.map(resume => (
              <Link href={`/resume-editor?resumeId=${resume.id}`} key={resume.id} className="block">
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                    <div className="font-medium truncate md:col-span-3">
                      {resume.resumeName}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 md:col-span-1">
                      <User className="mr-2 h-4 w-4" />
                      <span className="truncate">{resume.profileName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 md:col-span-1">
                      <Badge 
                        variant="secondary" 
                        className={`${resume.hasJobDescription ? 'text-yellow-800 bg-yellow-200': 'text-blue-800 bg-blue-200'} px-2 py-1 text-xs font-semibold`}
                      >
                        {resume.hasJobDescription ? 'Customizado' : 'ATS'}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 md:col-span-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {resume.createdAt 
                        ? new Date(resume.createdAt.seconds * 1000).toLocaleDateString() 
                        : 'Data não disponível'}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filteredResumes.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              Nenhum currículo encontrado.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}