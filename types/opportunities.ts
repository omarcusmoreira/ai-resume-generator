export enum OpportunityStatusEnum {
    APPLIED = 'applied',
    HR_CONTACT = 'HR contact',
    INTERVIEW = 'interview',
    OFFER = 'offer',
    REJECTED = 'rejected',
}

export type ContactType = {
    name: string;
    email: string;
    phone: string;
};
  
export type OpportunityType = {
    id: string;
    status: OpportunityStatusEnum;
    company: string;
    contacts: ContactType[];
    preparation: string;
    applicationDate: string;
    notes: string;
    source: string[];
};
  