"use client"

import { useState, useEffect, useRef } from 'react'
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

interface Resume {
  id: string;
  contentJSON: string;
  contentHTML?: string;
}

export default function ResumeEditor() {

  const resumeRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast();
  const { push } = useRouter();
  const { userData } = useUserDataStore()
  const { resumes, loading, addResume, deleteResume } = useResumeStore();

  const [isEditing, setIsEditing] = useState(false)


  const searchParams = useSearchParams()
  const resumeId = searchParams.get('resumeId') as string

  const resume = resumes.find(resume => resume.id === resumeId)
  
  const parseJSONToHTML = (jsonContent: string): string => {
    try {
      const content: ResumeData = JSON.parse(jsonContent);
      let html = '';

      html += `<h2>${userData?.personalInfo.name}</h2>`;
      html += `<p>${userData?.personalInfo.email}</p>`;
      html += `<p>${userData?.personalInfo.phone || ''}</p>`;
      html += `<p>${userData?.personalInfo.linkedinURL || ''}</p>`;
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

  const resumeContent = resume?.contentJSON ? parseJSONToHTML(resume.contentJSON) : '';

  const editor = useEditor({
    extensions: [StarterKit],
    content: resumeContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    toast({
      title: "Aviso",
      description: "As informações geradas pela IA podem conter imprecisões. Por favor, verifique cuidadosamente todos os detalhes antes de usar.",
      variant: 'warning',
      duration: 6000, 
    });
  }, [toast])

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

    const updatedResume: Resume = {
      ...resume,
      contentHTML: editor.getHTML(),
      contentJSON: resume.contentJSON || '' // Keep the original JSON
    }

    try {
      await addResume(updatedResume.id, updatedResume as ResumeType)
      setIsEditing(false)
      toast({
        title: "Sucesso",
        description: "Currículo salvo com sucesso!",
        variant: 'default',
      })
    } catch (error) {
      console.error("Error saving resume:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o currículo. Por favor, tente novamente.",
        variant: 'destructive',
      })
    }
  }
  
  const handleDelete = async() => {
    await deleteResume(resumeId)
    push('/resume-manager')
  }

  const handleDownloadHTML = () => {
    const content = editor?.getHTML()
    const blob = new Blob([content || ''], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'curriculo.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  const handleDownloadPDF = () => {
    if (resumeRef.current && typeof window !== 'undefined') {
      console.log('Downloading PDF...')
      const element = resumeRef.current;
      if (userData && resume) {
        const opt = {
          margin: 5,
          filename: resume.resumeName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: 'css', before: '.page-break' },
          footer: {
            height: '10mm',
            contents: {
              default: '<div style="text-align: center; font-size: 10px; color: #888;">Gerado por MeContrata.ai</div>'
            }
          }
        };
        console.log('opt...', opt)
        import('html2pdf.js').then((html2pdfModule) => {
          html2pdfModule.default().set(opt).from(element).save();
        });
      }
    }
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
      <Card className="w-full max-w-3xl md:p-6 p-1">
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Meu Currículo</h1>
              <Link href='/resume-generate'>
              <Button variant='ai' className='rounded-full'>
                <Sparkles className='h-4 w-4 mr-2'/>
                Gerar Currículo
              </Button>
              </Link>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Clique em Editar para começar. Use os botões de formatação para estilizar o texto. 
              Clique em Salvar quando terminar.
            </p>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <div className="flex w-full items-center justify-between space-x-2 overflow-hidden">
                
                  <div className="flex items-center space-x-2">
                    <Button onClick={isEditing ? saveResume : toggleEdit} variant={isEditing ? "default" : "outline"}>
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
                    <div className={`flex space-x-2 transition-all duration-300 ease-in-out ${isEditing ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>
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
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button onClick={handleDownloadPDF} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={handleDownloadHTML} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    HTML
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
              
              <div className="border rounded-md p-4 relative" ref={resumeRef}>
                <style jsx global>{`
                  .ProseMirror h1 {
                    font-size: 2em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                  }
                  .ProseMirror h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                  }
                  .ProseMirror h3 {
                    font-size: 1.17em;
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
                `}</style>
                <EditorContent editor={editor} />
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-gray-400 opacity-50">
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