'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Save, Edit2, Share2, Download, Trash2, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Client-side only import for html2pdf
const html2pdf = dynamic(() => import('html2pdf.js'), { ssr: false })
void html2pdf

import { getUserData } from '@/services/userServices'
import { useSearchParams } from 'next/navigation'
import { UserDataType } from '@/types/users'
import { ResumeBodyType, ResumeType } from '@/types/resumes'
import { getResume, updateResume } from '@/services/resumeServices'

export default function ResumePreviewPage() {
  const resumeId = useSearchParams().get('resumeId') as string
  const [userData, setUserData] = useState<UserDataType>()
  const [resume, setResume] = useState<ResumeType>()
  const [resumeBody, setResumeBody] = useState<ResumeBodyType>()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const resumeRef = useRef<HTMLDivElement>(null)

  const fetchUserData = async () => {
    const userData = await getUserData()
    const resume = await getResume(resumeId)
    if (resume && userData) {
      setUserData(userData)
      setResume(resume)
      setResumeBody(JSON.parse(resume.contentJSON))
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = useCallback(() => {
    setIsEditing(false)
    const resumeData = { ...resume, contentJSON: JSON.stringify(resumeBody) }
    if (resumeData.contentJSON) {
      updateResume(resumeId, resumeData)
    }
    console.log('Salvando alterações...', resumeBody)
  }, [resumeBody, resumeId, resume])

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
          filename: `CV_${userData.personalInfo.name.replace(/\s+/g, '_')}.pdf`,
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

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Excluindo currículo...')
  }

//   const updateResumeData = (path: string[], value: string) => {
//     setResumeData(prevData => {
//       const newData = JSON.parse(JSON.stringify(prevData))
//       let current = newData
//       for (let i = 0; i < path.length - 1; i++) {
//         current = current[path[i]]
//       }
//       current[path[path.length - 1]] = value
//       return newData
//     })
//   }

  const EditableField = ({ value, onChange, multiline = false }: { value: string, onChange?: (value: string) => void, multiline?: boolean }) => {
    const [fieldValue, setFieldValue] = useState(value)

    const handleChange = (newValue: string) => {
      setFieldValue(newValue)
      if (onChange) {
        onChange(newValue)
      }
    }

    if (isEditing) {
      return multiline ? (
        <Textarea
          value={fieldValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
      ) : (
        <Input
          type="text"
          value={fieldValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
      )
    }
    return <span className="text-sm">{fieldValue}</span>
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto relative pb-8" ref={resumeRef}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="flex justify-end">
              <Button variant="ghost" size="sm" className="flex items-center">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                <span>Salvar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit} disabled>
                <Edit2 className="h-4 w-4 mr-2" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                <span>Compartilhar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                <span>Baixar PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-500">Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <Image
              src={userData?.personalInfo.profilePicture || ''}
              alt={userData?.personalInfo.name || ''}
              width={80}
              height={80}
              className="rounded-full mr-4"
            />
            <div>
              <h1 className="text-xl font-bold">{userData?.personalInfo.name}</h1>
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
              value={resumeBody?.summary || ''}
            //   onChange={(value) => updateResumeData(['summary'], value)}
              multiline
            />

            <h2 className="text-lg font-semibold mb-2 mt-4">Experiência Profissional</h2>
            {resumeBody?.professionalExperience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-base font-medium">
                  <EditableField
                    value={exp.position || ''}
                    // onChange={(value) => updateResumeData(['professionalExperience', index, 'position'], value)}
                  /> na <EditableField
                    value={exp.company || ''}
                    // onChange={(value) => updateResumeData(['professionalExperience', index, 'company'], value)}
                  />
                </h3>
                <p className="text-xs text-gray-600">
                  <EditableField
                    value={exp.dates || ''}
                    // onChange={(value) => updateResumeData(['professionalExperience', index, 'dates'], value)}
                  />
                </p>
                <ul className="list-disc pl-5 mt-2">
                  {exp.responsibilities.map((resp, respIndex) => (
                    <li key={respIndex}>
                      <EditableField
                        value={resp}
                        // onChange={(value) => updateResumeData(['professionalExperience', index, 'responsibilities', respIndex], value)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h2 className="text-lg font-semibold mb-2 mt-4">Formação Acadêmica</h2>
            {resumeBody?.academicBackground.map((edu, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-base font-medium">
                  <EditableField
                    value={edu.degree}
                    // onChange={(value) => updateResumeData(['academicBackground', index, 'degree'], value)}
                  />
                </h3>
                <p>
                  <EditableField
                    value={edu.institution}
                    // onChange={(value) => updateResumeData(['academicBackground', index, 'institution'], value)}
                  />, <EditableField
                    value={edu.graduationYear}
                    // onChange={(value) => updateResumeData(['academicBackground', index, 'graduationYear'], value)}
                  />
                </p>
              </div>
            ))}

            <h2 className="text-lg font-semibold mb-2 mt-4">Idiomas</h2>
            <ul className="list-disc pl-5">
              {resumeBody?.languages.map((lang, index) => (
                <li key={index}>
                  <EditableField
                    value={lang.language}
                    // onChange={(value) => updateResumeData(['languages', index, 'language'], value)}
                  /> - <EditableField
                    value={lang.fluency}
                    // onChange={(value) => updateResumeData(['languages', index, 'fluency'], value)}
                  />
                </li>
              ))}
            </ul>

            {Object.keys(resumeBody?.extraCurricular || {}).length > 0 && (
              <>
                <h2 className="text-lg font-semibold mb-2 mt-4">Atividades Extracurriculares</h2>
                {/* Render extra-curricular activities here if any */}
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