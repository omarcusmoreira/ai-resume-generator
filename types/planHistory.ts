enum PlanTypeEnum {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium'
}
 
enum PlanChangeTypeEnum { 
  NEW = 'new',  
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  RENEWAL = 'renewal'
}

export { PlanChangeTypeEnum, PlanTypeEnum };

import { Timestamp } from "firebase/firestore";

export type QuotasType = {
    interactions: number | null;
    profiles: number | null;
    resumes: number | null;
    opportunities: number | null;
    recruiters: number | null;
  };
  
 export const PlanQuotas: { [key in PlanTypeEnum]: QuotasType } = {
    [PlanTypeEnum.FREE]: {
      profiles: 1,
      resumes: 2,
      interactions: 10,
      opportunities: 10,
      recruiters: 10,
    },
    [PlanTypeEnum.BASIC]: {
      profiles: 3,
      resumes: 6,
      interactions: 30,
      opportunities: 30,
      recruiters: 30,
    },
    [PlanTypeEnum.PREMIUM]: {
      profiles: 10,
      resumes: 20,
      interactions: 60,
      opportunities: 200,
      recruiters: 200,
    },
  };

  export type PlanHistoryData = {
    id: string;
    plan: PlanTypeEnum;
    changeType: PlanChangeTypeEnum;
    amountPaid: number;
  };

export class PlanHistory implements PlanHistoryData {
  id: string;
  plan: PlanTypeEnum;
  quotas: QuotasType;
  planChangeDate: Timestamp;
  expirationDate: Timestamp;
  changeType: PlanChangeTypeEnum;
  amountPaid: number;
  
  constructor(data: PlanHistoryData) {
    this.id = data.id;
    this.plan = data.plan;
    this.changeType = data.changeType;
    this.amountPaid = data.amountPaid;
    this.planChangeDate = Timestamp.now(); 

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 30);
    this.expirationDate = Timestamp.fromDate(expiration);
    this.quotas = PlanQuotas[this.plan];
  }
}

//eslint-disable-next-line
export function createPlanHistoryObject(data: PlanHistoryData): Record<string, any> {
  const planChangeDate = Timestamp.now();
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 30);
  const expirationDate = Timestamp.fromDate(expiration);

  return {
    id: data.id,
    plan: data.plan,
    changeType: data.changeType,
    amountPaid: data.amountPaid,
    planChangeDate: planChangeDate,
    expirationDate: expirationDate,
    quotas: PlanQuotas[data.plan],
  };
}