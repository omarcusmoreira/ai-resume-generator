import { Timestamp } from "firebase/firestore";

export enum OpportunityStatusEnum {
    APPLIED = 'applied',
    HR_CONTACT = 'HR contact',
    INTERVIEW = 'interview',
    OFFER = 'offer',
    REJECTED = 'rejected',
    DECLINED = 'declined',
    CANCELED = 'canceled',
}
  
export type OpportunityType = {
    id: string;
    status: OpportunityStatusEnum;
    position: string;
    companyName: string;
    contactName: string;
    contactPhone: string;
    resumeName: string;
    profileName: string;
    opportunityDate: Timestamp;
    nextInterviewDate?: Timestamp;
    source?: string;
};
  