enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium'
}
 
enum PlanChangeType { 
  NEW = 'new',  
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  RENEWAL = 'renewal'
}

export { PlanChangeType, PlanType };

import { Timestamp } from "firebase/firestore";

export type QuotasType = {
    interactions: number;
    profiles: number;
    resumes: number;
    opportunities: number;
  };
  
  const PlanQuotas: { [key in PlanType]: QuotasType } = {
    [PlanType.FREE]: {
      interactions: 10,
      profiles: 1,
      resumes: 1,
      opportunities: 0,
    },
    [PlanType.BASIC]: {
      interactions: 50,
      profiles: 3,
      resumes: 5,
      opportunities: 20,
    },
    [PlanType.PREMIUM]: {
      interactions: 100,
      profiles: 5,
      resumes: 10,
      opportunities: 50,
    },
  };

  export type PlanHistoryData = {
    plan: PlanType;
    changeType: PlanChangeType;
    amountPaid: number;
  };

export class PlanHistory implements PlanHistoryData {
  plan: PlanType;
  quotas: {
    interactions: number,
    profiles: number,
    resumes: number,
    opportunities: number
  };
  planChangeDate: Timestamp;
  changeType: PlanChangeType;
  amountPaid: number;
  
  constructor(data: PlanHistoryData) {
    this.plan = data.plan;
    this.changeType = data.changeType;
    this.planChangeDate = Timestamp.now();  
    this.quotas = PlanQuotas[this.plan];
    this.amountPaid = data.amountPaid;
  }
}