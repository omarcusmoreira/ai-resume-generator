'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, Heading1, Heading2, Heading3, Edit, Save, Download, Sparkles, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useResumeStore } from '@/stores/resumeStore'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ResumeType } from '@/types/resumes'
import { useUserDataStore } from '@/stores/userDataStore'
import { pdf } from '@react-pdf/renderer'
import PDFDocument from '@/components/PDFResume'

// Define interfaces for our resume data structure
interface Job {
  company: string;
  position: string;
  dates: string;
  responsibilities: string[];
}

interface Education {
  degree: string;
  institution: string;
  graduationYear: string;
}

interface Language {
  language: string;
  fluency: string;
}

interface ResumeData {
  summary: string;
  professionalExperience: Job[];
  academicBackground: Education[];
  languages: Language[];
  extraCurricular: string;
}

export default function ResumeEditor() {


    const resumeRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast();
    const { push } = useRouter();
    const { userData } = useUserDataStore()
    const { resumes, loading, updateResume, deleteResume } = useResumeStore();
  
    const [isEditing, setIsEditing] = useState(false)
    const searchParams = useSearchParams()
  
    const resumeId = searchParams.get('resumeId') as string
    const resume = resumes.find(resume => resume.id === resumeId)
  
    useEffect(() => {
      toast({
        title: "Aviso",
        description: "As informações geradas pela IA podem conter imprecisões. Por favor, verifique cuidadosamente todos os detalhes antes de usar.",
        variant: 'warning',
        duration: 6000, 
      });
    }, [toast])
    
    const parseJSONToHTML = (jsonContent: string): string => {
      try {
        const content: ResumeData = JSON.parse(jsonContent);
        let html = '';
  
        html += `<h1>${userData?.personalInfo.name}</h2>`;
        html += `<p>${userData?.personalInfo.email}</p>`;
        html += `<p>${userData?.personalInfo.phone || ''}</p>`;
        html += `<p>${userData?.personalInfo.linkedinURL || ''}</p>`;
        html += `<p>${userData?.personalInfo.city || ''}</p>`;

        // Summary
        html += `<h2>Resumo</h1><p>${content.summary}</p>`;
  
        // Professional Experience
        html += '<h2>Experiência Profissional</h1>';
        content.professionalExperience.forEach((job: Job) => {
          html += `<h3>${job.company} - ${job.position}</h2>`;
          html += `<p>${job.dates}</p>`;
          html += '<ul>';
          job.responsibilities.forEach(resp => {
            html += `<li>${resp}</li>`;
          });
          html += '</ul>';
        });
  
        // Academic Background
        html += '<h2>Formação Acadêmica</h1>';
        content.academicBackground.forEach((edu: Education) => {
          html += `<p>${edu.degree} - ${edu.institution}, ${edu.graduationYear}</p>`;
        });
  
        // Languages
        html += '<h2>Idiomas</h1>';
        content.languages.forEach((lang: Language) => {
          html += `<p>${lang.language}: ${lang.fluency}</p>`;
        });
  
        // Extra Curricular
        html += '<h2>Atividades Extracurriculares</h1>';
        html += `<p>${content.extraCurricular}</p>`;
  
        return html;
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return '<p>Error parsing resume content</p>';
      }
    };
    
    const getInitialContent = (resume: ResumeType | undefined): string => {
      if (!resume) return '';
      if (resume.contentHTML) return resume.contentHTML;
      if (resume.contentJSON) return parseJSONToHTML(resume.contentJSON);
      return '';
    }
  
    const editor = useEditor({
      extensions: [StarterKit],
      content: getInitialContent(resume),
      editorProps: {
        attributes: {
          class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
        },
      },
    })
  
    useEffect(() => {
      if (editor) {
        editor.setEditable(isEditing)
      }
    }, [editor, isEditing])
  
    const toggleEdit = () => {
      setIsEditing(!isEditing)
    }
  
    const saveResume = async () => {
      if (!editor || !resume) return;
    
      const updatedResume: Partial<ResumeType> = {
        contentHTML: editor.getHTML(),
        contentJSON: resume.contentJSON || '' // Keep the original JSON
      }
    
      try {
        await updateResume(resumeId, updatedResume)
        setIsEditing(false)
        toast({
          title: "Sucesso",
          description: "Currículo atualizado com sucesso!",
          variant: 'default',
        })
      } catch (error) {
        console.error("Error updating resume:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao atualizar o currículo. Por favor, tente novamente.",
          variant: 'destructive',
        })
      }
    }
  
    const handleDelete = async() => {
      await deleteResume(resumeId)
      push('/resume-manager')
    }

  
  const handleDownloadPDF = async () => {
    if (editor && resume) {
      const content = editor.getHTML()
      const blob = await pdf(<PDFDocument content={content} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.resumeName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-8 overflow-auto">
      <Card className="w-full max-w-3xl mx-auto">
        <main className="p-2 sm:p-4 md:p-6">
          <div className="space-y-4 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Meu Currículo</h1>
              <Link href='/resume-generate'>
                <Button variant='ai' className='rounded-full w-full sm:w-auto'>
                  <Sparkles className='h-4 w-4 mr-2'/>
                  Gerar Currículo
                </Button>
              </Link>
            </div>
            <div className='space-y-2'>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Clique em Editar para começar, use os botões de formatação para estilizar o texto e clique em Salvar quando terminar.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Para incluir suas informações pessoais como Telefone, Cidade e perfil do LinkedIn, acesse a página do usuário clicando
                <Link href={'/user-info'} className='text-purple-800'> aqui</Link>.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={isEditing ? saveResume : toggleEdit} 
                  variant={isEditing ? "default" : "outline"}
                  className="w-full sm:w-auto"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
                <div className={`flex flex-wrap gap-2 transition-all duration-300 ease-in-out ${isEditing ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={!editor?.can().chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                    <span className="sr-only">Negrito</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={!editor?.can().chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                    <span className="sr-only">Itálico</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    disabled={!editor?.can().chain().focus().toggleHeading({ level: 1 }).run()}
                  >
                    <Heading1 className="h-4 w-4" />
                    <span className="sr-only">Título 1</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    disabled={!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    <Heading2 className="h-4 w-4" />
                    <span className="sr-only">Título 2</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    disabled={!editor?.can().chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    <Heading3 className="h-4 w-4" />
                    <span className="sr-only">Título 3</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    disabled={!editor?.can().chain().focus().toggleBulletList().run()}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">Lista com Marcadores</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button onClick={handleDownloadPDF} disabled={isEditing} variant="outline" className="w-full sm:w-auto">
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className='hidden sm:block'>
                      PDF
                    </span>

                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apagar o currículo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white">
                          Apagar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="border rounded-md p-2 sm:p-4 relative" ref={resumeRef}>
                <style jsx global>{`
                  .ProseMirror {
                    min-height: 300px;
                    max-height: 70vh;
                    overflow-y: auto;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                  }
                  .ProseMirror h1 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                  }
                  .ProseMirror h2 {
                    font-size: 1.3em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                  }
                  .ProseMirror h3 {
                    font-size: 1.1em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                  }
                  .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                  }
                  .ProseMirror li {
                    margin-bottom: 0.5em;
                  }
                  @media (min-width: 640px) {
                    .ProseMirror h1 { font-size: 2em; }
                    .ProseMirror h2 { font-size: 1.5em; }
                    .ProseMirror h3 { font-size: 1.17em; }
                  }
                `}</style>
                <EditorContent editor={editor} />
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-gray-400 opacity-50 text-xs">
                  Gerado por mecontrata.ai
                </div>
              </div>
            </div>
          </div>
        </main>
      </Card>
    </div>
  )
}