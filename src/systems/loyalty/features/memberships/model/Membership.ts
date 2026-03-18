export interface LoyaltyMember {
  id: number;
  fullName: string;
  visits: number;
  rewardPoints: number;
}

export interface MembershipMetrics {
  totalMembers: number;
  avgVisits: number;
  avgRewardPoints: number;
}
