import { OpportunityStatusEnum } from "@/types/opportunities"

export const getStatusColor = (status: string) => {
  switch (status) {
    case OpportunityStatusEnum.APPLIED:
      return 'bg-blue-100 text-blue-800'; // Informational
    case OpportunityStatusEnum.HR_CONTACT:
      return 'bg-yellow-100 text-yellow-800'; // Attention required
    case OpportunityStatusEnum.INTERVIEW:
      return 'bg-yellow-100 text-yellow-800'; // Attention required
    case OpportunityStatusEnum.OFFER:
      return 'bg-green-100 text-green-800'; // Positive progress
    case OpportunityStatusEnum.REJECTED:
      return 'bg-red-100 text-red-800'; // Negative outcome
    case OpportunityStatusEnum.DECLINED:
      return 'bg-gray-100 text-gray-800'; // Neutral
    case OpportunityStatusEnum.CANCELED:
      return 'bg-red-100 text-red-800'; // Negative outcome
    default:
      return 'bg-gray-100 text-gray-800'; // Default to neutral
  }
};
