"use client"

import { useState, useEffect } from 'react'
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
import { getResumes } from '@/services/resumeServices'; // Import the function
import { ResumeType } from '@/types/resumes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getQuotas } from '@/services/quotaServices'

export default function ResumeManagerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [resumes, setResumes] = useState<ResumeType[]>([]);
  const [quota, setQuota] = useState<number>(0)

  useEffect(() => {
    const fetchResumes = async () => {
      const fetchedResumes = await getResumes(); 
      const fetchedQuotas = await getQuotas()
      setQuota(fetchedQuotas.resumes)
      setResumes(fetchedResumes);
    };
    fetchResumes();
  }, []); // Fetch resumes on component mount

  const filteredResumes = resumes ? resumes.filter(resume => 
    // Ensure resumeName and profileName are defined before applying toLowerCase
    resume.resumeName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter === "all" || (resume.profileName && resume.profileName.toLowerCase().includes(filter.toLowerCase())) || (resume.resumeName && resume.resumeName.toLowerCase().includes(filter.toLowerCase())))
  ) : [];

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">

      <Card className='w-full max-w-3xl p-4 md:p-6'>
        <div className="container mx-auto p-4 space-y-6">
          <div className='flex w-full justify-between'>

          <h1 className="text-3xl font-bold">Meus Currículos</h1>
        
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/resume-generate" passHref>
                            <Button variant="ai" className="rounded-full bg-primary text-white"
                            >
                                <Sparkles className='h-4 w-4 mr-2' />
                                Gerar Currículo
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{`Voce ainda tem ${quota} currículos disponiveis`}</p>
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
                    .filter(profile => profile))) // Filter out undefined or empty profiles
                    .map(profile => (
                    <DropdownMenuItem key={profile} onSelect={() => setFilter(profile)}>{profile}</DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {filteredResumes.map(resume => (
              <Link href={`/resume-preview?resumeId=${resume.id}`} key={resume.id} className="block">
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="font-medium truncate md:col-span-2">
                            {resume.resumeName}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 md:col-span-2">
                            <User className="mr-2 h-4 w-4" />
                            <span className="truncate">{resume.profileName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
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
