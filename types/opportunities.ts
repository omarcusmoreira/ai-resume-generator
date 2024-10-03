import { Timestamp } from "firebase/firestore";

export enum OpportunityStatusEnum {
    APPLIED = 'Candidatado',
    HR_CONTACT = 'Contato RH',
    INTERVIEW = 'Entrevista',
    OFFER = 'Oferta',
    REJECTED = 'Rejeitado',
    DECLINED = 'Recusado',
    CANCELED = 'Cancelado',
}

export enum InterviewStageEnum {
    HR_SCREENING = 'Triagem RH',
    PHONE_INTERVIEW = 'Entrevista Telefônica',
    VIDEO_INTERVIEW = 'Entrevista por Vídeo',
    IN_PERSON_INTERVIEW = 'Entrevista Presencial',
    ASSESSMENT_TEST = 'Teste de Avaliação',
    PORTFOLIO_REVIEW = 'Revisão de Portfólio',
    TECHNICAL_TEST = 'Teste Técnico',
    TECHNICAL_INTERVIEW = 'Entrevista Técnica',
    CASE_STUDY = 'Apresentação de Estudo de Caso',
    GROUP_INTERVIEW = 'Entrevista em Grupo',
    MANAGEMENT_INTERVIEW = 'Entrevista com a Gestão',
    FINAL_INTERVIEW = 'Entrevista Final',
}


export type InterviewStage = {
    id: string;
    name: InterviewStageEnum;
    expectedDate: Timestamp;
    status: 'Passed' | 'Failed' | 'In Progress';
    recruiterId: string;
    notes: string;
}


export type OpportunityType = {
    id: string;
    companyName: string;
    position: string;
    salary: number | null;
    jobFormat: 'remote' | 'onsite' | 'hybrid';
    opportunityLink: string;
    recruiterId: string;
    profileId: string;
    resumeId: string;
    status: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    interviewStages?: InterviewStage[];
    source: string;
};
  