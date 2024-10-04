'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Save, Edit2, Share2, Download, Trash2, MoreVertical, RotateCcw, Check } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
// Client-side only import for html2pdf
const html2pdf = dynamic(() => import('html2pdf.js'), { ssr: false })
void html2pdf
import { useSearchParams } from 'next/navigation'
import { ResumeBodyType, ResumeType } from '@/types/resumes'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useResumeStore } from '@/stores/resumeStore'
import { useQuotaStore } from '@/stores/quotaStore'
import { useUserDataStore } from '@/stores/userDataStore'
import { useToast } from '@/hooks/use-toast'

export default function ResumePreviewPage() {

  const resumeId = useSearchParams().get('resumeId') as string
  const router = useRouter()

  const { userData } = useUserDataStore();
  const { resumes, loading, updateResume, deleteResume } = useResumeStore();
  const { quotas, decreaseQuota } = useQuotaStore();
  const { toast } = useToast();

  const [resume, setResume] = useState<ResumeType>()
  const [resumeBody, setResumeBody] = useState<ResumeBodyType>()
  const [localResumeBody, setLocalResumeBody] = useState<ResumeBodyType>()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const resumeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resumeToPreview = resumes.find(resume => resume.id === resumeId);
    setResume(resumeToPreview);
  }, [resumes, resumeId]);
  
  useEffect(() => {
    if (resume && resume.contentJSON) {
      try {
        const parsedBody = JSON.parse(resume.contentJSON);
        setResumeBody(parsedBody);
      } catch (error) {
        console.error('Error parsing resume content:', error);
      }
    }
  }, [resume]);
  

  useEffect(() => {
    setLocalResumeBody(resumeBody)
  }, [resumeBody])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = useCallback(async () => {
    setIsEditing(false)
    const resumeData = { ...resume, contentJSON: JSON.stringify(localResumeBody) }
    if (resumeData.contentJSON) {
      try {
        const response = await updateResume(resumeId, resumeData)
        
        console.log('Update response:', response)
        setResumeBody(localResumeBody)
      } catch (error) {
        console.error('Error updating resume:', error)
      }
    }
    //eslint-disable-next-line
  }, [localResumeBody, resumeId, resume])

  const handleShare = () => {
    // Implement share functionality
    console.log('Compartilhando currículo...')
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

  const handleDelete = async() => {
    await deleteResume(resumeId)
    router.push('/resume-manager')
  }

  const handleRegenerate = () => {
    router.push('/resume-generate')
  }

  const handleAccept = async () => {
    await updateResume(resumeId, { isAccepted: true } as Partial<ResumeType>)
    await decreaseQuota('resumes')
    toast({
      title: "Currículo salvo",
      description: `Voce ainda tem mais ${quotas.resumes && quotas.resumes-1} currículo(s)`,
    });
  }

  const updateResumeData = (path: string[], value: string) => {
    setLocalResumeBody(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData))
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  const EditableField = ({ value, onChange, multiline = false }: { value: string, onChange?: (value: string) => void, multiline?: boolean }) => {
    const [fieldValue, setFieldValue] = useState(value)

    const handleBlur = () => {
      if (onChange) {
        onChange(fieldValue)
      }
    }

    useEffect(() => {
      setFieldValue(value)
    }, [value])

    if (isEditing) {
      return multiline ? (
        <Textarea
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 border rounded text-sm"
        />
      ) : (
        <Input
          type="text"
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 border rounded text-sm"
        />
      )
    }
    return <span className="text-sm">{fieldValue}</span>
  }

  const ActionButtons = () => (
    <div className="flex w-full justify-between gap-2">
      <div className="flex gap-2">
        {isEditing ? (
          <Button onClick={handleSave} size="sm" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white">
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Salvar</span>
          </Button>):(
        <Button onClick={handleEdit} size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
          <Edit2 className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Editar</span>
        </Button>
        )}
        <Button onClick={handleDownloadPDF} size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Baixar PDF</span>
        </Button>
        <Button onClick={handleShare} size="sm" disabled className="bg-purple-500 hover:bg-purple-600 text-white">
          <Share2 className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </div>
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
  )

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-8 mt-4">
      <div className={`p-4 mb-4 rounded-lg ${resume?.isAccepted ? 'bg-purple-400' : 'bg-yellow-100'}`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className={`font-medium text-lg ${resume?.isAccepted ? 'text-white' : 'text-yellow-800'}`}>
            {resume?.isAccepted ? `Voce pode gerar mais ${quotas.resumes} currículo(s).` : 'Revise seu currículo abaixo.'}
          </h2>
          {resume?.isAccepted && (
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-purple-500">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSave} >
                    <Save className="h-4 w-4 mr-2" />
                    <span>Salvar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Baixar PDF</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    <span>Compartilhar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500"/>
                    <span className="text-red-500">Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {!resume?.isAccepted && (
          <>
          <p className="text-[12px] text-yellow-700">
          Atenção: Os currículos gerado por IA, podem conter informações incorretas.
          </p> 
           <p className="text-[12px] mb-4 text-yellow-700">
           Aceite para editar ou fazer o download do seu currículo, caso opte por refazer, sua cota não será afetada.
          </p>
          </>
        )}
        <div className="flex flex-wrap gap-2">
          {!resume?.isAccepted ? (
            <>
              <Button onClick={handleRegenerate} variant="outline" size="sm" className="bg-white hover:bg-yellow-50">
                <RotateCcw className="h-4 w-4 mr-2" />
                Refazer
              </Button>
              <Button onClick={handleAccept} disabled={loading} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Check className="h-4 w-4 mr-2" />
                Aceitar
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
              <ActionButtons />
            </div>
          )}
        </div>
      </div>
      <Card className="w-full max-w-4xl mx-auto relative pb-8" ref={resumeRef}>
        <CardContent className="pt-4">
          <div className="flex items-center mb-6">
            { userData?.personalInfo.profilePicture &&
            <Image
              src={userData?.personalInfo.profilePicture || ''}
              alt={userData?.personalInfo.name || ''}
              width={80}
              height={80}
              className="rounded-full mr-4"
            />
            }
            <div>
              <h1 className="text-2xl font-bold">{userData?.personalInfo.name}</h1>
              <p className="text-sm">{userData?.personalInfo.email} | {userData?.personalInfo.phone}</p>
              <p className="text-sm">{userData?.personalInfo.city}</p>
              <a href={userData?.personalInfo.linkedinURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-sm">
                {userData?.personalInfo.linkedinURL}
              </a>
            </div>
          </div>
          <div className="prose max-w-none text-sm">
            <h2 className="text-lg font-semibold mb-2">Resumo</h2>
            <EditableField
              value={localResumeBody?.summary || ''}
              onChange={(value) => updateResumeData(['summary'], value)}
              multiline
            />

            <h2 className="text-lg font-semibold mb-2 mt-4">Experiência Profissional</h2>
            {localResumeBody?.professionalExperience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-base font-medium">
                  <EditableField
                    value={exp.position || ''}
                    onChange={(value) => updateResumeData(['professionalExperience', index.toString(), 'position'], value)}
                  /> na <EditableField
                    value={exp.company || ''}
                    onChange={(value) => updateResumeData(['professionalExperience', index.toString(), 'company'], value)}
                  />
                </h3>
                <p className="text-xs text-gray-600">
                  <EditableField
                    value={exp.dates || ''}
                    onChange={(value) => updateResumeData(['professionalExperience', index.toString(), 'dates'], value)}
                  />
                </p>
                <ul className="list-disc pl-5 mt-2">
                  {exp.responsibilities.map((resp, respIndex) => (
                    <li key={respIndex}>
                      <EditableField
                        value={resp}
                        onChange={(value) => updateResumeData(['professionalExperience', index.toString(), 'responsibilities', respIndex.toString()], value)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h2 className="text-lg font-semibold mb-2 mt-4">Formação Acadêmica</h2>
            {localResumeBody?.academicBackground.map((edu, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-base font-medium">
                  <EditableField
                    value={edu.degree}
                    onChange={(value) => updateResumeData(['academicBackground', index.toString(), 'degree'], value)}
                  />
                </h3>
                <p>
                  <EditableField
                    value={edu.institution}
                    onChange={(value) => updateResumeData(['academicBackground', index.toString(), 'institution'], value)}
                  />, <EditableField
                    value={edu.graduationYear}
                    onChange={(value) => updateResumeData(['academicBackground', index.toString(), 'graduationYear'], value)}
                  />
                </p>
              </div>
            ))}

            <h2 className="text-lg font-semibold mb-2 mt-4">Idiomas</h2>
            <ul className="list-disc pl-5">
              {localResumeBody?.languages.map((lang, index) => (
                <li key={index}>
                  <EditableField
                    value={lang.language}
                    onChange={(value) => updateResumeData(['languages', index.toString(), 'language'], value)}
                  /> - <EditableField
                    value={lang.fluency}
                    onChange={(value) => updateResumeData(['languages', index.toString(), 'fluency'], value)}
                  />
                </li>
              ))}
            </ul>

            {Object.keys(localResumeBody?.extraCurricular || {}).length > 0 && (
              <>
                <h2 className="text-lg font-semibold mb-2 mt-4">Atividades Extracurriculares</h2>
                {/* Render extra-curricular activities here if any */}
                <EditableField
                  value={typeof localResumeBody?.extraCurricular === 'string' ? localResumeBody.extraCurricular : ''} 
                  onChange={(value) => updateResumeData(['extraCurricular'], value)}
                  multiline
                />
              </>
            )}
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 text-center p-2 text-gray-400 text-sm font-light">
          Gerado por MeContrata.ai
        </div>
      </Card>
    </div>
  )
}