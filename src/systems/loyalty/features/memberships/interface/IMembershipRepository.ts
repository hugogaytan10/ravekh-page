import type { LoyaltyMember } from "../model/Membership";

export interface IMembershipRepository {
  getMembers(token: string, businessId: number): Promise<LoyaltyMember[]>;
}
