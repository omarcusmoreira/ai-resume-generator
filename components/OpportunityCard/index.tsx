import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InterviewStage, OpportunityStatusEnum, OpportunityType } from "@/types/opportunities"
import { Briefcase, MapPin, DollarSign, User, Phone, FileText, Trash2, Calendar, Clock } from "lucide-react"
import OpportunityForm from "../OpportunityForm"
import InterviewStagesDialog from "../InterviewStagesDialog"
import { useRouter } from "next/navigation"
import { useRecruiterStore } from "@/stores/recruiterStore"
import { useProfileStore } from "@/stores/profileStore"
import { useResumeStore } from "@/stores/resumeStore"
import { useOpportunityStore } from "@/stores/opportunityStore"
import { RecruiterType } from "@/types/recruiter"
import { ResumeType } from "@/types/resumes"
import { TimestampRenderer } from "@/utils/TimestampRender"

type OpportunityCardProps = {
    opportunity: OpportunityType
    openDeleteDialog: (opportunity: OpportunityType) => void
}

export const OpportunityCard = ({ opportunity, openDeleteDialog }: OpportunityCardProps) => {
  const { push } = useRouter()
  const { recruiters } = useRecruiterStore()
  const { profiles } = useProfileStore()
  const { resumes } = useResumeStore()
  const { updateOpportunity } = useOpportunityStore()

  const recruiter = recruiters.find((r: RecruiterType) => r.id === opportunity.recruiterId)
  const resume = resumes.find((r: ResumeType) => r.id === opportunity.resumeId)

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      [OpportunityStatusEnum.APPLIED]: 'Currículo Enviado',
      [OpportunityStatusEnum.HR_CONTACT]: 'Contato com RH',
      [OpportunityStatusEnum.INTERVIEW]: 'Entrevista',
      [OpportunityStatusEnum.OFFER]: 'Oferta',
      [OpportunityStatusEnum.REJECTED]: 'Rejeitado',
      [OpportunityStatusEnum.CANCELED]: 'Cancelado',
      [OpportunityStatusEnum.DECLINED]: 'Declinado',
    }
    return statusMap[status] || 'Desconhecido'
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      [OpportunityStatusEnum.APPLIED]: 'bg-blue-100 text-blue-800',
      [OpportunityStatusEnum.HR_CONTACT]: 'bg-yellow-100 text-yellow-800',
      [OpportunityStatusEnum.INTERVIEW]: 'bg-purple-100 text-purple-800',
      [OpportunityStatusEnum.OFFER]: 'bg-green-100 text-green-800',
      [OpportunityStatusEnum.REJECTED]: 'bg-red-100 text-red-800',
      [OpportunityStatusEnum.CANCELED]: 'bg-gray-100 text-gray-800',
      [OpportunityStatusEnum.DECLINED]: 'bg-orange-100 text-orange-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const handleSaveInterviewStage = (newStage: InterviewStage) => {
    const currentStages = Array.isArray(opportunity.interviewStages) 
      ? opportunity.interviewStages 
      : [];
    const updatedStages = [...currentStages, newStage];
    const updatedOpportunity = { ...opportunity, interviewStages: updatedStages };
    updateOpportunity(updatedOpportunity);
  }

  const handleClickResume = (resumeId: string | undefined) => {
    if (resumeId) {
      push(`/resume-preview?resumeId=${resumeId}`)
    }
  }

  return (
    <Card className="w-full min-w-[320px] mx-auto h-full flex flex-col justify-between">
      <div>

      <CardHeader className="py-4 mb-2 bg-purple-100 max-h-[80px]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 truncate max-w-[160px]">{opportunity.companyName}</h2>
            <p className="text-[.7rem] text-gray-400">
              <TimestampRenderer format='toLocale' timestamp={opportunity.createdAt} fallback="sem data"/>
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(opportunity.status)} px-2 py-1 text-xs font-semibold`}
          >
            {getStatusText(opportunity.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">{opportunity.position}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">{opportunity.salary ? `$${opportunity.salary.toLocaleString()}` : 'Não especificado'}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">{opportunity.jobFormat}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm truncate">{recruiter?.name || 'Sem contato'}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Etapas da Entrevista</h3>
          <div className="flex flex-wrap gap-2">
            {opportunity.interviewStages && opportunity.interviewStages.length > 0 ? (
              opportunity.interviewStages.map((stage, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                  {stage.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">Nenhuma etapa definida</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Detalhes de Contato</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{recruiter?.name || 'Sem recrutador'}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{recruiter?.phone || 'Sem telefone'}</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-gray-500" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm truncate max-w-[250px] cursor-pointer hover:underline" onClick={() => handleClickResume(resume?.id)}>
                      {resume?.resumeName || 'Sem currículo'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{opportunity.resumeId || 'Sem ID de currículo'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {opportunity.interviewStages && opportunity.interviewStages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Próxima Entrevista</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{opportunity.interviewStages[0].name}</span>
                <Badge variant="outline" className="text-xs">
                  {opportunity.interviewStages[0].status}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                  <TimestampRenderer 
                    fallback='Sem data' 
                    format='toISODate' 
                    timestamp={opportunity.interviewStages[0].expectedDate} 
                    />
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Clock className="h-4 w-4 mr-2" />
                  <TimestampRenderer 
                    fallback='Sem horário' 
                    format='time' 
                    timestamp={opportunity.interviewStages[0].expectedDate} 
                  />
              </div>
            </div>
          </div>
        )}
      </CardContent>
        </div>
      <CardFooter className="flex justify-between items-center flex-wrap">
        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
          <span>Perfil: {profiles.find(profile => profile.id === opportunity.profileId)?.profileName || 'Sem perfil'}</span>
        </div>
        <div className="flex space-x-2 justify-between w-full">
          <div className="flex gap-2">
            <InterviewStagesDialog onSave={handleSaveInterviewStage} />
            <OpportunityForm opportunity={opportunity} editMode={true} />
          </div>
          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(opportunity)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}