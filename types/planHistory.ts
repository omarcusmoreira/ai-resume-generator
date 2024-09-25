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
    interactions: number;
    profiles: number;
    resumes: number;
    opportunities: number;
  };
  
  const PlanQuotas: { [key in PlanTypeEnum]: QuotasType } = {
    [PlanTypeEnum.FREE]: {
      interactions: 20,
      profiles: 2,
      resumes: 5,
      opportunities: 0,
    },
    [PlanTypeEnum.BASIC]: {
      interactions: 50,
      profiles: 5,
      resumes: 15,
      opportunities: 20,
    },
    [PlanTypeEnum.PREMIUM]: {
      interactions: 100,
      profiles: 10,
      resumes: 30,
      opportunities: 100,
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