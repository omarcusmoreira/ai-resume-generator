import React from 'react'
import { Briefcase, DollarSign, FileText, MapPin, Phone, Trash2, User } from "lucide-react"
import OpportunityForm from "../OpportunityForm"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { TimestampRenderer } from "@/utils/TimestampRender"
import { InterviewStage, OpportunityStatusEnum, OpportunityType } from "@/types/opportunities"
import { useRecruiterStore } from "@/stores/recruiterStore"
import { useResumeStore } from "@/stores/resumeStore"
import { useOpportunityStore } from "@/stores/opportunityStore"
import { RecruiterType } from "@/types/recruiter"
import { ResumeType } from "@/types/resumes"
import { getStatusColor } from "@/utils/getStatusColor"
import InterviewStagesDialog from "../InterviewStagesDialog"
import { useProfileStore } from '@/stores/profileStore'

type OpportunityCardProps = {
    opportunity: OpportunityType
    openDeleteDialog: (opportunity: OpportunityType) => void
}

export const OpportunityCard = ({ opportunity, openDeleteDialog }: OpportunityCardProps) => {
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

  // const getNextInterviewStage = (stages: InterviewStage[] | undefined): InterviewStage | null => {
  //   if (!stages || !Array.isArray(stages) || stages.length === 0) {
  //     console.warn('Invalid or empty stages array:', stages);
  //     return null;
  //   }
  
  //   const now = Date.now();
  
  //   //eslint-disable-next-line
  //   const getTimestamp = (date: any): number | null => {
  //     if (date && typeof date.toMillis === 'function') {
  //       return date.toMillis(); // Firestore Timestamp
  //     } else if (date && typeof date === 'object' && 'seconds' in date) {
  //       return date.seconds * 1000; // Plain object with seconds
  //     } else if (date && typeof date === 'object' && 'milliseconds' in date) {
  //       return date.milliseconds; // Plain object with milliseconds
  //     } else if (date && typeof date === 'number') {
  //       return date; // Already a timestamp in milliseconds
  //     }
  //     console.warn('Invalid date format:', date);
  //     return null;
  //   };
  
  //   const upcomingStages = stages.filter(stage => {
  //     const timestamp = getTimestamp(stage.expectedDate);
  //     return timestamp !== null && timestamp > now;
  //   });
  
  //   if (upcomingStages.length === 0) return null;
  
  //   return upcomingStages.reduce((earliest, current) => {
  //     const earliestTimestamp = getTimestamp(earliest.expectedDate);
  //     const currentTimestamp = getTimestamp(current.expectedDate);
  //     if (currentTimestamp === null || earliestTimestamp === null) {
  //       console.warn('Invalid timestamp in reduce:', { earliest, current });
  //       return earliest;
  //     }
  //     return currentTimestamp < earliestTimestamp ? current : earliest;
  //   });
  // };
  
  const handleSaveInterviewStage = (newStage: InterviewStage) => {
    const currentStages = Array.isArray(opportunity.interviewStages) 
      ? opportunity.interviewStages 
      : [];
    const updatedStages = [...currentStages, newStage];
    const updatedOpportunity = { ...opportunity, interviewStages: updatedStages };
    updateOpportunity(updatedOpportunity);
  }

  return (
<div className="border border-purple-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-purple-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-purple-800 text-lg">{opportunity.companyName}</h3>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(opportunity.status)} px-2 py-1 text-xs font-semibold`}
          >
            {getStatusText(opportunity.status)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
          {/* Left column */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-purple-800">{opportunity.position}</span>
            </div>
            <div className="hidden md:flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-purple-800">{opportunity.jobFormat}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-purple-800">{opportunity.salary ? `$${opportunity.salary.toLocaleString()}` : 'Não especificado'}</span>
            </div>
          </div>
          
          {/* Middle column */}
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-purple-800 truncate">{recruiter?.name || 'Sem contato'}</span>
            </div>
            <div className="hidden md:flex items-center">
              <Phone className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-purple-800 truncate">{recruiter?.phone || 'Sem telefone'}</span>
            </div>
          </div>
          
          {/* Right column - Interview Stages */}
          <div className="space-y-2">
            <h4 className="font-semibold text-purple-700">Entrevistas:</h4>
            {opportunity.interviewStages && opportunity.interviewStages.length > 0 ? (
              opportunity.interviewStages.map((stage: InterviewStage) => (
                <div key={stage.id} className="text-xs">
                  <div className="font-medium text-purple-800">{stage.name}</div>
                  <div className="text-purple-600">
                    <TimestampRenderer fallback='Sem data' format='toISODate' timestamp={stage.expectedDate} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-purple-600 text-xs">Sem entrevistas agendadas</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-gray-50 border-t border-purple-100 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1 text-purple-600" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-purple-800 truncate max-w-[150px]">{resume?.resumeName || 'Sem currículo'}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{opportunity.resumeId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-purple-600" />
            <span className="text-purple-800 truncate max-w-[150px]">{profiles.find( profile => profile.id === opportunity.profileId)?.profileName || 'Sem perfil'}</span>
          </div>
        </div>
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <InterviewStagesDialog onSave={handleSaveInterviewStage} />
          <OpportunityForm opportunity={opportunity} editMode={true}/>
          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(opportunity)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

