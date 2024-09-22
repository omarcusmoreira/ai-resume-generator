'use client'

import { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import ReactMarkdown from 'react-markdown'
import { Edit2, Share2, Download, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Progress } from "@/components/ui/progress"
import remarkGfm from 'remark-gfm'
import { ResumeType } from '@/types/resumes'
import { PersonalInfoType } from '@/types/users'
import { getUserData } from '@/services/userServices'
import { getResume, updateResume } from '@/services/resumeServices'

function ResumeContent() {
  const resumeId = useSearchParams().get('resumeId') as string
  const [resume, setResume] = useState<ResumeType | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoType | null>(null)
  const [resumeContent, setResumeContent] = useState<string>(resume?.contentJSON || '')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  console.log(resumeId);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData()
      const resume = await getResume(resumeId)
      setPersonalInfo(userData?.personalInfo || null)
      setResume(resume)
      setResumeContent(resume?.contentJSON || '')
    }
    fetchData() 
  }, [resumeId])


  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = useCallback(async () => {
    setIsEditing(false)
    setResumeContent(resumeContent) 
    if (!resume) {
      throw new Error('Selected resume not found')
    } else {
      await updateResume(resumeId, {  contentJSON: resumeContent })
    }
  }, [resumeContent, resumeId, resume])

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing resume...')
  }

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log('Downloading PDF...')
  }

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Deleting resume...')
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeContent(e.target.value)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        handleSave()
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, handleSave])

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{resume?.profileName}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleEdit} className="flex items-center">
              <Edit2 className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              <span>Compartilhar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadPDF} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              <span>Baixar PDF</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá deletar permanentemente seu currículo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <Image
              src={personalInfo?.profilePicture || '/avatar_placeholder.png'}
              alt={personalInfo?.name || 'Profile Picture'}
              width={100}
              height={100}
              className="rounded-full mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold">{personalInfo?.name || ''}</h1>
              <p>{personalInfo?.email || ''} | {personalInfo?.phone || '' }</p>
              <p>{personalInfo?.city || ''}</p>
              <a href={personalInfo?.linkedinURL || ''} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                LinkedIn Profile
              </a>
            </div>
          </div>
          <div className="prose max-w-none">
            {isEditing ? (
              <Textarea
                ref={textareaRef}
                value={resumeContent}
                onChange={handleContentChange}
                className="w-full h-[500px] p-2 border rounded"
                placeholder="Edit your resume here..."
              />
            ) : (
              <div onClick={handleEdit}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{resumeContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  const [progress, setProgress] = useState(13)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full max-w-xl mx-auto mt-10 space-y-4">
      <Progress value={progress} className="w-full" />
      <p className="text-center text-sm text-muted-foreground">Loading resume...</p>
    </div>
  )
}

export default function ResumeRender() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResumeContent />
    </Suspense>
  )
}